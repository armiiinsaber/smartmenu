// File: app/menu/[slug]/page.tsx
import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

// Initialize Supabase client (public key is okay for reads)
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
  const languages = Object.keys(translations) as string[];
  const [activeLang, setActiveLang] = React.useState(languages[0] || '');

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>{name}</h1>
      <div style={{ marginBottom: '1rem' }}>
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            style={{
              marginRight: '0.5rem',
              padding: '0.5rem 1rem',
              background: activeLang === lang ? '#333' : '#eee',
              color: activeLang === lang ? '#fff' : '#000',
              border: 'none',
              borderRadius: 4,
            }}
          >
            {lang}
          </button>
        ))}
      </div>
      <pre style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
        {translations[activeLang]}
      </pre>
    </div>
  );
}
