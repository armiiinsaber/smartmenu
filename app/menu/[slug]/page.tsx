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
    return <p className="text-center mt-12 text-gray-600">Loading menu...</p>;
  }

  const rows = translations[currentLang]
    .split('\n')
    .map(line => line.split('|').map(cell => cell.trim()));

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-gray-900 px-6 py-12">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8 space-y-8">
        <h1 className="text-4xl font-serif text-center text-gray-900">
          {restaurantName}
        </h1>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {Object.keys(translations).map(lang => (
            <button
              key={lang}
              onClick={() => setCurrentLang(lang)}
              className={`px-4 py-2 text-sm font-semibold rounded-full border transition-colors disabled:opacity-50 ${
                currentLang === lang
                  ? 'bg-[#C9B458] text-white border-[#C9B458]'
                  : 'bg-transparent text-gray-900 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        <table className="w-full">
          <thead className="border-b-2 border-[#C9B458]">
            <tr>
              <th className="pb-3 text-left text-lg font-serif">Dish</th>
              <th className="pb-3 text-left text-lg font-serif">Description</th>
              <th className="pb-3 text-right text-lg font-serif">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((cols, idx) => (
              <tr key={idx}>
                <td className="py-4 font-medium text-base text-gray-900">{cols[0] || ''}</td>
                <td className="py-4 text-base text-gray-700">{cols[1] || ''}</td>
                <td className="py-4 text-base text-gray-900 text-right">{cols[2] || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
