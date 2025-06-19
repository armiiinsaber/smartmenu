// File: app/menu/[slug]/page.tsx
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import React from 'react';

// Initialize Supabase client for reads
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PageProps = {
  params: {
    slug: string;
  };
};

export default async function MenuPage({ params }: PageProps) {
  const { slug } = params;

  // Fetch the menu row by slug
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
      {langs.map((lang) => (
        <section key={lang} style={{ marginBottom: '2rem' }}>
          <h2 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>{lang}</h2>
          <pre style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{translations[lang]}</pre>
        </section>
      ))}
    </div>
  );
}
