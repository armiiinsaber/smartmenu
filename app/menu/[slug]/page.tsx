```tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type TranslationsMap = Record<string, string>;

interface MenuEntry {
  type: 'section' | 'item';
  title?: string;
  name?: string;
  desc?: string;
  price?: string;
}

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

  // Parse and structure rows into sections and items
  const rows: string[][] = translations[currentLang]
    .split('\n')
    .map(line => line.split('|').map(cell => cell.trim()));

  const structured: MenuEntry[] = rows.map(cols => {
    const [first, second, third] = cols;
    // Section header: only title
    if (first && !second && !third) {
      return { type: 'section', title: first };
    }
    return { type: 'item', name: first, desc: second, price: third };
  });

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-gray-900 px-6 py-12">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-10">
        {/* Header with decorative flourish */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-serif text-gray-900">{restaurantName}</h1>
          <div className="mt-2 h-1 w-24 bg-[#C9B458] mx-auto"></div>
          <div className="text-[#C9B458] text-2xl mt-4">❧</div>
        </header>

        {/* Language selection */}
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

        {/* Menu items with ornate sections */}
        <ul className="space-y-10">
          {structured.map((entry, idx) => (
            entry.type === 'section' ? (
              <li key={idx} className="">
                <h2 className="text-2xl font-serif text-center text-gray-900 uppercase">
                  {entry.title}
                </h2>
                <div className="flex justify-center my-3">
                  <span className="block h-px w-16 bg-[#C9B458]"></span>
                  <span className="mx-3 text-[#C9B458] text-lg">❧</span>
                  <span className="block h-px w-16 bg-[#C9B458]"></span>
                </div>
              </li>
            ) : (
              <li key={idx} className="space-y-1">
                <div className="flex items-center">
                  <h3 className="font-serif text-xl text-gray-900">{entry.name}</h3>
                  <span className="flex-grow border-b border-dotted border-gray-300 mx-4"></span>
                  <span className="font-serif text-xl text-gray-900">{entry.price}</span>
                </div>
                {entry.desc && (
                  <p className="text-base text-gray-700 ml-1">{entry.desc}</p>
                )}
              </li>
            )
          ))}
        </ul>
      </div>
    </div>
  );
}
```
