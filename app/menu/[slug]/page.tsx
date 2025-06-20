// File: app/menu/[slug]/page.tsx
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PageProps = { params: { slug: string } };

export default async function MenuPage({ params }: PageProps) {
  const { slug } = params;

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
  const defaultLang = langs.includes('English') ? 'English' : langs[0];

  return (
    <html lang="en">
      <body style={{ fontFamily: 'Helvetica Neue, sans-serif', padding: '2rem', backgroundColor: '#fff', color: '#111' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>{name}</h1>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {langs.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  const sections = document.querySelectorAll('[data-lang]');
                  sections.forEach(sec => (sec as HTMLElement).style.display = 'none');
                  const target = document.querySelector(`[data-lang="${lang}"]`) as HTMLElement;
                  if (target) target.style.display = 'block';
                }}
                style={{
                  margin: '0.3rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#eee',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {lang}
              </button>
            ))}
          </div>

          {langs.map((lang) => (
            <section
              key={lang}
              data-lang={lang}
              style={{ display: lang === defaultLang ? 'block' : 'none' }}
            >
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 1rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', fontSize: '1rem', borderBottom: '2px solid #ccc' }}>
                    <th style={{ width: '35%' }}>Dish</th>
                    <th style={{ width: '50%' }}>Description</th>
                    <th style={{ width: '15%', textAlign: 'right' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {translations[lang].split(/\n+/).map((line, idx) => {
                    const [dish, description, price] = line.split(/\s*[|–]\s*/);
                    return (
                      <tr key={idx} style={{ backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{dish}</td>
                        <td style={{ padding: '0.75rem' }}>{description}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', whiteSpace: 'nowrap' }}>{price}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      </body>
    </html>
  );
}
