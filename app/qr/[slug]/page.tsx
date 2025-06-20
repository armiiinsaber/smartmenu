'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import QRBlock from '../../../components/QRBlock';

export default function QRPage() {
  const params = useParams() as { slug?: string };
  const slug = params.slug;
  if (!slug) {
    return (
      <p style={{ textAlign: 'center', marginTop: '2rem', fontFamily: 'sans-serif' }}>
        ⚠️ Invalid QR code
      </p>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Scan to View Menu</h1>
      <QRBlock slug={slug} />
    </div>
  );
}
