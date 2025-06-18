// pages/builder.tsx
import React, { useState } from 'react'
import { read, utils } from 'xlsx'
import DataGrid from 'react-data-grid'
import axios from 'axios'
import { useRouter } from 'next/router'

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
]

type Row = Record<string, any>

export default function BuilderPage() {
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['fr','es','zh','ar','fa'])
  const [loading, setLoading] = useState(false)

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const data = ev.target?.result
      let wb = typeof data === 'string'
        ? read(data, { type: 'binary' })
        : read(new Uint8Array(data as ArrayBuffer))
      const ws = wb.Sheets[wb.SheetNames[0]]
      const json: Row[] = utils.sheet_to_json(ws, { defval: '' })
      if (!json.length) return
      setColumns(Object.keys(json[0]).map(key => ({
        key, name: key, editable: true, resizable: true, width: 200
      })))
      setRows(json)
    }
    file.name.match(/\.(csv|txt)$/i)
      ? reader.readAsBinaryString(file)
      : reader.readAsArrayBuffer(file)
  }

  async function handleTranslateAndGenerate() {
    if (!rows.length || !selectedLanguages.length) return
    setLoading(true)
    try {
      const { data } = await axios.post('/api/generate', {
        menu: rows,
        languages: selectedLanguages
      })
      const { slug, translatedMenus } = data
      // Redirect *with* the actual translated data and lang list
      router.push({
        pathname: `/menu/${slug}`,
        query: {
          langs: selectedLanguages.join(','),
          data: encodeURIComponent(JSON.stringify(translatedMenus))
        }
      })
    } catch {
      alert('Translation failed—see console for details.')
    }
    setLoading(false)
  }

  function toggleLang(code: string) {
    setSelectedLanguages(prev =>
      prev.includes(code)
        ? prev.filter(l => l !== code)
        : [...prev, code]
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">SmartMenu Builder</h1>
      <input type="file" accept=".csv,.txt,.xlsx" onChange={handleFileUpload} className="mb-4" />
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
              <input type="checkbox" checked={selectedLanguages.includes(code)} onChange={() => toggleLang(code)} />
              <span>{name}</span>
            </label>
          ))}
        </div>
      </div>
      <button
        onClick={handleTranslateAndGenerate}
        disabled={loading || !rows.length || !selectedLanguages.length}
        className="px-6 py-3 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        {loading ? 'Translating…' : 'Translate & Generate Link'}
      </button>
    </div>
  )
}
