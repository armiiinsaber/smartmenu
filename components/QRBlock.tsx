// File: components/QRBlock.tsx
'use client';

import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

export default function QRBlock({ slug }: { slug: string }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && slug) {
      setUrl(`${window.location.origin}/menu/${slug}`);
    }
  }, [slug]);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      {url && (
        <>
          <div style={{ background: '#fff', padding: '1rem', display: 'inline-block' }}>
            <QRCode value={url} size={160} />
          </div>
          <p style={{ fontSize: 12, marginTop: '.5rem', wordBreak: 'break-all' }}>
            <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
          </p>
        </>
      )}
    </div>
  );
}
