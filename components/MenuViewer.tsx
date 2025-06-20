// File: components/MenuViewer.tsx
'use client';

import React, { useState } from 'react';

type Props = {
  name: string;
  translations: Record<string, string>;
};

export default function MenuViewer({ name, translations }: Props) {
  const langs = Object.keys(translations);
  const [activeLang, setActiveLang] = useState(langs[0] || '');
  const lines = translations[activeLang]?.split(/\n/) || [];

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>{name}</h1>
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
              cursor: 'pointer'
            }}
          >{lang}</button>
        ))}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {lines.map((line, idx) => {
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

// File: app/menu/[slug]/page.tsx (update)
import dynamic from 'next/dynamic';

// Replace the client-side div with this dynamic component:
const MenuViewer = dynamic(() => import('@/components/MenuViewer'), { ssr: false });

export default async function MenuPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { data, error } = await supabase
    .from('menus')
    .select('name, translations')
    .eq('slug', slug)
    .single();
  if (error || !data) notFound();

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <MenuViewer name={data.name} translations={data.translations} />
    </div>
  );
}
