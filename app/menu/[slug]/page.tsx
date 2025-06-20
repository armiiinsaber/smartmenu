// app/menu/[slug]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type TranslationsMap = Record<string, string>;

export default function MenuPage() {
  const { slug } = useParams() as { slug: string };
  const [restaurantName, setRestaurantName] = useState('');
  const [translations, setTranslations] = useState<TranslationsMap>({});
  const [currentLang, setCurrentLang] = useState('');

  useEffect(() => {
    if (!slug) return;
    const stored = sessionStorage.getItem(`menu-${slug}`);
    if (stored) {
      const parsed = JSON.parse(stored) as {
        restaurantName: string;
        translations: TranslationsMap;
      };
      setRestaurantName(parsed.restaurantName);
      setTranslations(parsed.translations);
      const langs = Object.keys(parsed.translations);
      setCurrentLang(langs[0] || '');
    }
  }, [slug]);

  if (!restaurantName || !currentLang) {
    return <p className="text-center mt-8">Loading menu...</p>;
  }

  const rows = translations[currentLang]
    .split('\n')
    .map(line => line.split('|').map(cell => cell.trim()));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-3xl font-semibold mb-4 text-center">
          {restaurantName}
        </h1>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {Object.keys(translations).map(lang => (
            <button
              key={lang}
              onClick={() => setCurrentLang(lang)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                currentLang === lang
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        <table className="w-full text-left">
          <thead className="border-b-2 border-gray-200">
            <tr>
              <th className="pb-2 text-lg">Dish</th>
              <th className="pb-2 text-lg">Description</th>
              <th className="pb-2 text-lg text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((cols, idx) => (
              <tr key={idx} className="py-2">
                <td className="py-3 align-top font-medium text-base">{cols[0] || ''}</td>
                <td className="py-3 align-top text-base">{cols[1] || ''}</td>
                <td className="py-3 align-top text-base text-right">{cols[2] || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
