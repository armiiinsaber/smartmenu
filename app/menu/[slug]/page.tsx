// File: app/menu/[slug]/page.tsx
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import React from 'react';

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PageProps = { params: { slug: string } };

export default async function MenuPage({ params }: PageProps) {
  const { slug } = params;

  let data;
  try {
    const res = await supabase
      .from('menus')
      .select('name, translations')
      .eq('slug', slug)
      .single();

    if (res.error || !res.data) {
      return notFound();
    }
    data = res.data;
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return notFound();
  }

  const { name, translations } = data;
  const languages = Object.keys(translations) as string[];

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>{name}</h1>
      {/* Client-side language toggles */}
      <div id="menu-app"></div>
    </div>
  );
}
