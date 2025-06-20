
// File: app/menu/[slug]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MenuPage() {
  const { slug } = useParams();
  const [name, setName] = useState('');
  const [translations, setTranslations] = useState<Record<string,string>>({});
  const [activeLang, setActiveLang] = useState('English');
  const [langs, setLangs] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('menus')
        .select('name, translations')
        .eq('slug', slug)
        .single();
      if (!error && data) {
        setName(data.name);
        setTranslations(data.translations);
        setLangs(Object.keys(data.translations));
        setActiveLang(Object.keys(data.translations)[0] || '');
      }
    })();
  }, [slug]);

  const menuLines = translations[activeLang]?.split(/\n/) || [];

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>{name}</h1>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        {langs.map(lang => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            style={{
              margin: '0 .5rem',
              padding: '.5rem 1rem',
              background: activeLang === lang ? '#333' : '#eee',
              color: activeLang === lang ? '#fff' : '#000',
              border: 'none',
              borderRadius: 4,
            }}
          >{lang}</button>
        ))}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {menuLines.map((line, idx) => {
            const [dish, description, price] = line.split(/\s*–\s*/);
            return (
              <tr key={idx}>
                <td style={{ padding: '.5rem', fontWeight: 'bold' }}>{dish}</td>
                <td style={{ padding: '.5rem' }}>{description}</td>
                <td style={{ padding: '.5rem', textAlign: 'right' }}>{price || ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
