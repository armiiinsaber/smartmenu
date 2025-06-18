// pages/builder.tsx
import React, { useState } from 'react';
import { read, utils } from 'xlsx';
import DataGrid from 'react-data-grid';
import axios from 'axios';

const TOP_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ur', name: 'Urdu' },
  { code: 'id', name: 'Indonesian' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'sw', name: 'Swahili' },
  { code: 'mr', name: 'Marathi' },
  { code: 'fa', name: 'Farsi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ta', name: 'Tamil' }
];

type Row = Record<string, any>;

export default function BuilderPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['fr', 'es', 'zh', 'ar', 'fa']);
  const [loading, setLoading] = useState(false);
  const [resultSlug, setResultSlug] = useState<string | null>(null);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;
      let workbook;
      if (typeof data === 'string') {
        workbook = read(data, { type: 'binary' });
      } else {
        workbook = read(new Uint8Array(data as ArrayBuffer));
      }
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: Row[] = utils.sheet_to_json(worksheet, { defval: '' });
      if (jsonData.length === 0) return;

      // Create columns from keys of first row
      const cols = Object.keys(jsonData[0]).map((key) => ({
        key,
        name: key,
        editable: true,
        resizable: true,
        width: 200
      }));

      setColumns(cols);
      setRows(jsonData);
      setResultSlug(null);
    };

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }

  async function handleTranslateAndGenerate() {
    if (rows.length === 0 || selectedLanguages.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        menu: rows,
        languages: selectedLanguages
      };
      // Mock API call - replace with your real endpoint
      const response = await axios.post('/api/generate', payload);
      setResultSlug(response.data.slug);
    } catch (error) {
      alert('Translation failed, try again.');
    }
    setLoading(false);
  }

  function handleLanguageToggle(langCode: string) {
    setSelectedLanguages((prev) =>
      prev.includes(langCode) ? prev.filter((l) => l !== langCode) : [...prev, langCode]
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">SmartMenu Builder</h1>

      <input
        type="file"
        accept=".csv,.txt,.xlsx"
        onChange={handleFileUpload}
        className="mb-4"
      />

      {columns.length > 0 && (
        <div className="mb-4" style={{ height: 400 }}>
          <DataGrid columns={columns} rows={rows} onRowsChange={setRows} />
        </div>
      )}

      <div className="mb-4">
        <h2 className="font-semibold mb-2">Select Languages to Translate:</h2>
        <div className="flex flex-wrap gap-2 max-w-3xl">
          {TOP_LANGUAGES.map(({ code, name }) => (
            <label key={code} className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedLanguages.includes(code)}
                onChange={() => handleLanguageToggle(code)}
              />
              <span>{name}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleTranslateAndGenerate}
        disabled={loading || rows.length === 0 || selectedLanguages.length === 0}
        className="px-6 py-3 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        {loading ? 'Translating...' : 'Translate & Generate Link'}
      </button>

      {resultSlug && (
        <div className="mt-6">
          <p className="mb-2">Your menu is ready! View it here:</p>
          <a
            href={`/menu/${resultSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 underline"
          >
            /menu/{resultSlug}
          </a>
        </div>
      )}
    </div>
  );
}
