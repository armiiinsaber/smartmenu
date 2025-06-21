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

  // Parse and group Category|Dish|Description|Price
  const rows = translations[currentLang]
    .split('\n')
    .map(line => line.split('|').map(cell => cell.trim()))
    .filter(parts => parts.length >= 4);

  const entries: MenuEntry[] = rows.map(
    ([category, name, desc, price]) => ({ category, name, desc, price })
  );

  const grouped = entries.reduce((acc: Record<string, MenuEntry[]>, e) => {
    (acc[e.category] = acc[e.category] || []).push(e);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-gray-900 px-6 py-12">
      <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl p-12 border-2 border-[#C9B458] relative overflow-hidden">
        {/* Gold corner dingbats */}
        <div className="absolute top-4 left-4 text-[#C9B458] text-2xl">❖</div>
        <div className="absolute bottom-4 right-4 text-[#C9B458] text-2xl">❖</div>

        {/* Restaurant Title */}
        <header className="text-center mb-10">
          <h1 className="text-5xl font-serif leading-tight text-gray-900">
            {restaurantName}
          </h1>
          <div className="mt-2 h-1 w-24 bg-[#C9B458] mx-auto"></div>
        </header>

        {/* Languages (scrollable row) */}
        <div className="mb-8 -mx-6 px-6 overflow-x-auto whitespace-nowrap">
          {Object.keys(translations).map(lang => (
            <button
              key={lang}
              onClick={() => setCurrentLang(lang)}
              className={`inline-block mx-1 px-4 py-2 text-sm font-semibold rounded-full border transition-colors ${
                currentLang === lang
                  ? 'bg-[#C9B458] text-white border-[#C9B458]'
                  : 'bg-transparent text-gray-900 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Menu Sections */}
        <div className="space-y-20">
          {categories.map(category => (
            <section key={category} className="mt-12">
              {/* Category Header */}
              <h2 className="text-2xl font-serif uppercase tracking-wider leading-tight text-center text-gray-900">
                {category}
              </h2>

              {/* Items using CSS Grid */}
              <ul className="space-y-6 mt-6">
                {grouped[category].map((item, idx) => (
                  <li
                    key={idx}
                    className="grid grid-cols-[1fr_auto] items-start gap-x-4"
                  >
                    {/* Dish name + description */}
                    <div>
                      <h3 className="font-serif text-xl uppercase tracking-wide leading-snug text-gray-900">
                        {item.name}
                      </h3>
                      {item.desc && (
                        <p className="text-sm italic leading-relaxed text-gray-700 mt-1 ml-1">
                          {item.desc}
                        </p>
                      )}
                    </div>

                    {/* Price aligned right */}
                    <span className="font-serif text-xl leading-snug text-gray-900">
                      {item.price}
                    </span>
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
