// File: app/menu/[slug]/page.tsx
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import React from 'react';

// Supabase client for server-side fetch
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PageProps = { params: { slug: string } };

export default async function MenuPage({ params }: PageProps) {
  const { slug } = params;

  // Fetch menu data server-side
  const { data, error } = await supabase
    .from('menus')
    .select('name, translations')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    notFound();
  }

  const { name, translations } = data;
  const langs = Object.keys(translations) as string[];

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>{name}</h1>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        {langs.map(lang => (
          <button
            key={lang}
            onClick={() => {} /* no-op in server component */}
            style={{
              margin: '0 .5rem',
              padding: '.5rem 1rem',
              background: '#eee',
              color: '#000',
              border: 'none',
              borderRadius: 4,
            }}
          >{lang}</button>
        ))}
      </div>
      {langs.map(lang => (
        <section key={lang} style={{ display: lang === langs[0] ? 'block' : 'none' }}>
          <h2 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>{lang}</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {translations[lang].split(/\n/).map((line, idx) => {
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
        </section>
      ))}
    </div>
  );
}
