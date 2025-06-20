// File: app/qr/[slug]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import QRBlock from '../../../components/QRBlock'; // ← relative path from here

export default function QRPage() {
  const { slug } = useParams() as { slug?: string };

  if (!slug) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem', fontFamily: 'sans-serif' }}>
        ⚠️ Invalid or missing code
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        padding: '1rem',
      }}
    >
      <h1 style={{ marginBottom: '1rem' }}>Scan to View Menu</h1>
      <QRBlock slug={slug} />
    </main>
  );
}
