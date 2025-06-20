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

  // build an <img> src to the free QR code API
  const qrSrc = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`
    : '';

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      {qrSrc && (
        <>
          <img
            src={qrSrc}
            alt="QR Code"
            style={{ background: '#fff', padding: '1rem', display: 'inline-block' }}
          />
          <p style={{ fontSize: 12, marginTop: '.5rem', wordBreak: 'break-all' }}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </a>
          </p>
        </>
      )}
    </div>
  );
}
