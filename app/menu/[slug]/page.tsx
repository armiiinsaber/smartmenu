// File: app/menu/[slug]/page.tsx
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// Supabase client for server-side fetch
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

  if (error || !data) notFound();

  const { name, translations } = data;
  const langs = Object.keys(translations) as string[];

  return (
    <html lang="en">
      <head>
        <title>{name} | Menu</title>
        <style>{`
          body { font-family: 'Georgia', serif; padding: 2rem; max-width: 700px; margin: auto; }
          h1 { text-align: center; margin-bottom: 2rem; }
          .lang-switcher { text-align: center; margin-bottom: 2rem; }
          .lang-switcher button {
            margin: 0.3rem;
            padding: 0.5rem 1rem;
            border: none;
            background: #eee;
            cursor: pointer;
            border-radius: 4px;
          }
          .menu-section { display: none; }
          .menu-section.active { display: block; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; border-bottom: 1px solid #999; padding: 0.5rem 0; }
          td { padding: 0.4rem 0; vertical-align: top; }
          td.price { text-align: right; white-space: nowrap; }
        `}</style>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.onload = () => {
              const buttons = document.querySelectorAll('button[data-lang]');
              buttons.forEach(btn => {
                btn.onclick = () => {
                  document.querySelectorAll('.menu-section').forEach(el => el.classList.remove('active'));
                  document.getElementById('lang-' + btn.dataset.lang)?.classList.add('active');
                };
              });
              document.getElementById('lang-English')?.classList.add('active');
            };
          `,
        }} />
      </head>
      <body>
        <h1>{name}</h1>
        <div className="lang-switcher">
          {langs.map(lang => (
            <button key={lang} data-lang={lang}>{lang}</button>
          ))}
        </div>

        {langs.map(lang => (
          <section key={lang} id={`lang-${lang}`} className="menu-section">
            <table>
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Description</th>
                  <th className="price">Price</th>
                </tr>
              </thead>
              <tbody>
                {translations[lang].split(/\n/).map((line, idx) => {
                  const [dish = '', description = '', price = ''] = line.split('|').map(s => s.trim());
                  return (
                    <tr key={idx}>
                      <td>{dish}</td>
                      <td>{description}</td>
                      <td className="price">{price}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        ))}
      </body>
    </html>
  );
}
