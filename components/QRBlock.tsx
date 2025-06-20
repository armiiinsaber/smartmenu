// File: components/QRBlock.tsx
'use client';

import { useEffect, useState } from 'react';

export default function QRBlock({ slug }: { slug: string }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && slug) {
      setUrl(`${window.location.origin}/menu/${slug}`);
    }
  }, [slug]);

  // Use the free QR-Server API (no extra deps)
  const qrSrc = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        url
      )}`
    : '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '2rem 0',
      }}
    >
      {qrSrc && (
        <>
          <img
            src={qrSrc}
            alt="QR Code"
            style={{
              background: '#fff',
              padding: '1rem',
              borderRadius: '8px',
            }}
          />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: '0.75rem',
              wordBreak: 'break-all',
              textDecoration: 'none',
              color: '#000',
              fontSize: '0.9rem',
            }}
          >
            Open menu: {url}
          </a>
        </>
      )}
    </div>
  );
}
