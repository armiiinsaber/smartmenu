// pages/menu/[slug].tsx
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'fa', label: 'Farsi' }
];

type MenuItem = {
  'Dish Name': string;
  Description: string;
  Price: string;
};

export default function MenuPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [activeLang, setActiveLang] = useState('en');
  const [menuData, setMenuData] = useState<Record<string, MenuItem[]>>({});

  useEffect(() => {
    if (!slug) return;

    // Mock fetch translated menus (in production, fetch from DB)
    async function fetchMenu() {
      // For demo, create fake data
      const fakeData: Record<string, MenuItem[]> = {};
      LANGUAGES.forEach(({ code }) => {
        fakeData[code] = [
          {
            'Dish Name': `Margherita Pizza (${code})`,
            Description: `Classic pizza with tomato, mozzarella, and basil. [${code}]`,
            Price: '$12.00'
          },
          {
            'Dish Name': `Spaghetti Carbonara (${code})`,
            Description: `Pasta with egg yolk, pancetta, and pecorino cheese. [${code}]`,
            Price: '$15.50'
          }
        ];
      });
      setMenuData(fakeData);
    }

    fetchMenu();
  }, [slug]);

  if (!slug) return <p>Loading menu...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Menu: {slug}</h1>
      <div className="mb-4">
        {LANGUAGES.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => setActiveLang(code)}
            className={`mr-2 px-4 py-2 rounded ${
              activeLang === code ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 text-left">Dish Name</th>
            <th className="border border-gray-300 p-2 text-left">Description</th>
            <th className="border border-gray-300 p-2 text-left">Price</th>
          </tr>
        </thead>
        <tbody>
          {(menuData[activeLang] || []).map((item, i) => (
            <tr key={i}>
              <td className="border border-gray-300 p-2">{item['Dish Name']}</td>
              <td className="border border-gray-300 p-2">{item.Description}</td>
              <td className="border border-gray-300 p-2">{item.Price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
