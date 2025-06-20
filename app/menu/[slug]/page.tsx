// File: app/menu/[slug]/page.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Dynamically load the client-side menu viewer
const MenuViewer = dynamic(() => import('@/components/MenuViewer'), { ssr: false });

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
    return notFound();
  }

  // Render the client component for interactive toggles
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <MenuViewer name={data.name} translations={data.translations} />
    </div>
  );
}
