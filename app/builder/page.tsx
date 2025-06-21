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
      alert('Please fill out restaurant, menu text, and select at least one language.');
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

      // Persist and redirect to menu display
      sessionStorage.setItem(
        `menu-${payload.slug}`,
        JSON.stringify({ restaurantName: payload.restaurantName, translations: payload.translations })
      );
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
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-8 space-y-8">
        <h1 className="text-4xl font-serif text-gray-900 text-center">Acarte</h1>

        <div className="space-y-6">
          {/* Restaurant input */}
          <div>
            <label className="block text-xs uppercase text-gray-600 mb-2">Restaurant</label>
            <input
              type="text"
              value={restaurantName}
              onChange={e => setRestaurantName(e.target.value)}
              placeholder="e.g. Cipriani"
              disabled={loading}
              className="w-full border-b-2 border-gray-300 focus:border-[#C9B458] focus:outline-none pb-2 text-gray-900"
            />
          </div>

          {/* Menu text area */}
          <div>
            <label className="block text-xs uppercase text-gray-600 mb-2">Today’s Menu</label>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              rows={6}
              placeholder="Enter each line as Dish|Description|Price"
              disabled={loading}
              className="w-full border-b-2 border-gray-300 focus:border-[#C9B458] focus:outline-none pb-2 text-gray-900"
            />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-xs uppercase text-gray-600 mb-2">Or upload menu file</label>
            <input
              type="file"
              accept=".txt,.csv,.xlsx"
              ref={fileInputRef}
              onChange={handleFileUpload}
              disabled={loading}
              className="text-sm text-gray-500"
            />
          </div>

          {/* Language selection */}
          <div>
            <label className="block text-xs uppercase text-gray-600 mb-2">Your Guests Speak</label>
            <div className="flex flex-wrap gap-3">
              {languages.map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLang(lang)}
                  disabled={loading}
                  className={`px-4 py-2 text-sm font-semibold rounded-full border transition-colors disabled:opacity-50 ${
                    selectedLangs.includes(lang)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-transparent text-gray-900 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-8 py-3 font-serif uppercase tracking-wide border ${
                loading
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'text-[#C9B458] border-[#C9B458] hover:bg-[#C9B458] hover:text-white'
              } transition-colors`}
            >
              {loading ? 'Generating…' : 'Generate Menus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
