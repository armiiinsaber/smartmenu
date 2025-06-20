"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function BuilderPage() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState('');
  const [rawText, setRawText] = useState('');
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ru'];

  function toggleLang(lang: string) {
    setSelectedLangs(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  }

  async function handleSubmit() {
    if (!restaurantName || !rawText || selectedLangs.length === 0) {
      alert('Please fill out restaurant name, menu text, and select at least one language.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantName, text: rawText, languages: selectedLangs }),
      });
      const payload = await res.json();

      if (!res.ok) {
        alert(`Error ${res.status}: ${payload.error || JSON.stringify(payload)}`);
        setLoading(false);
        return;
      }

      // Redirect automatically when ready
      // Persist into sessionStorage for menu page
sessionStorage.setItem(
  `menu-${payload.slug}`,
  JSON.stringify({ restaurantName: payload.restaurantName, translations: payload.translations })
);
// Navigate to menu display
router.push(`/menu/${payload.slug}`);
    } catch (error: any) {
      alert(`Network error: ${error.message || error}`);
      setLoading(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawText(reader.result as string);
    };
    reader.readAsText(file);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-semibold mb-4 text-center">SmartMenu Builder</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Restaurant Name</label>
            <input
              type="text"
              value={restaurantName}
              onChange={e => setRestaurantName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="e.g. Cipriani"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Paste menu text</label>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="Enter each line as Dish|Description|Price"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Or upload file</label>
            <input
              type="file"
              accept=".txt,.csv,.xlsx"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Select languages (up to 10)</label>
            <div className="flex flex-wrap gap-2">
              {languages.map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLang(lang)}
                  disabled={loading}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    selectedLangs.includes(lang)
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`mt-4 px-6 py-2 rounded-lg font-medium transition ${
                loading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {loading ? 'Translating…' : 'Generate Menu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
