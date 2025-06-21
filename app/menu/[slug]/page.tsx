"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type TranslationsMap = Record<string, string>;

interface MenuEntry {
  category: string;
  name: string;
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

  // 1) Split lines → [category, name, desc, price]
  const rows = translations[currentLang]
    .split('\n')
    .map(line => line.split('|').map(cell => cell.trim()))
    .filter(parts => parts.length >= 3);

  // 2) Build entries
  const entries: MenuEntry[] = rows.map(
    ([category, name, desc, price]) => ({ category, name, desc, price })
  );

  // 3) Group by category
  const grouped = entries.reduce((acc: Record<string, MenuEntry[]>, e) => {
    (acc[e.category] = acc[e.category] || []).push(e);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-gray-900 px-6 py-12">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-10 border-2 border-[#C9B458] relative overflow-hidden">
        {/* Decorative corners */}
        <div className="absolute top-4 left-4 text-[#C9B458] text-2xl">❖</div>
        <div className="absolute bottom-4 right-4 text-[#C9B458] text-2xl">❖</div>

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-serif text-gray-900">{restaurantName}</h1>
          <div className="mt-2 h-1 w-24 bg-[#C9B458] mx-auto"></div>
          <div className="text-[#C9B458] text-2xl mt-4">❧</div>
        </header>

        {/* Language Selector */}
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

        {/* Categories & Items */}
        <div className="space-y-16">
          {categories.map((category) => (
            <section key={category}>
              {/* Category Title */}
              <h2 className="text-2xl font-serif text-center text-gray-900 uppercase tracking-widest mb-4">
                {category}
              </h2>

              {/* Items List */}
              <ul className="space-y-8">
                {grouped[category].map((item, idx) => (
                  <li key={idx} className="space-y-1">
                    <div className="flex items-center">
                      <h3 className="font-serif text-xl text-gray-900 uppercase tracking-wide">
                        {item.name}
                      </h3>
                      <span className="flex-grow border-b border-dotted border-gray-300 mx-6" />
                      <span className="font-serif text-xl text-gray-900">
                        {item.price}
                      </span>
                    </div>
                    {item.desc && (
                      <p className="text-base text-gray-700 ml-2 italic">
                        {item.desc}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
