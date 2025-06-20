// File: app/qr/[slug]/page.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamically import QRBlock to ensure it's client-side
const QRBlock = dynamic(() => import('@/components/QRBlock'), { ssr: false });

export default function QRPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();

  // If no slug, redirect back
  if (!slug) {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', fontFamily: 'sans-serif', background: '#fafafa' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Your QR Code</h1>
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Scan this code or click the link below to view your menu:
      </p>
      <QRBlock slug={slug} />
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <a href={`/menu/${slug}`} style={{ color: '#0070f3', textDecoration: 'underline' }}>
          View your menu
        </a>
      </div>
    </div>
  );
}
