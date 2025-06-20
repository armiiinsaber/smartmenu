'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function MenuPage() {
  const { slug } = useParams() as { slug?: string };
  const router = useRouter();
  const [data, setData] = useState<{
    restaurantName: string;
    translations: Record<string, string>;
  } | null>(null);

  // 1️⃣ Load from sessionStorage
  useEffect(() => {
    if (!slug) return;
    const raw = sessionStorage.getItem(`menu-${slug}`);
    if (!raw) {
      // if nothing saved under that key, go back
      router.replace('/');
      return;
    }
    setData(JSON.parse(raw));
  }, [slug, router]);

  if (!data) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem', fontFamily: 'sans-serif' }}>
        Loading your menu…
      </div>
    );
  }

  const { restaurantName, translations } = data;
  const langs = Object.keys(translations);
  const [currentLang, setCurrentLang] = useState(langs[0]);

  // Split the menu text into lines for display
  const lines = translations[currentLang]
    .split(/\r?\n/)
    .filter((l) => l.trim().length);

  return (
    <div style={{ maxWidth: 680, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>{restaurantName}</h1>

      {/* language buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem'
      }}>
        {langs.map((lang) => (
          <button
            key={lang}
            onClick={() => setCurrentLang(lang)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: currentLang === lang ? '#111' : '#eee',
              color: currentLang === lang ? '#fff' : '#000',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* menu in clean format */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333' }}>
            <th align="left" style={{ padding: '8px 4px' }}>Dish</th>
            <th align="left" style={{ padding: '8px 4px' }}>Description</th>
            <th align="right" style={{ padding: '8px 4px' }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, i) => {
            // assume CSV of “Dish | Description | $Price”
            const [dish, desc, price] = line.split('|').map(s => s.trim());
            return (
              <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px 4px' }}>{dish}</td>
                <td style={{ padding: '8px 4px' }}>{desc}</td>
                <td style={{ padding: '8px 4px', textAlign: 'right' }}>{price}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
