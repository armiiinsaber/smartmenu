// File: components/QRBlock.tsx
'use client';

import { useEffect, useState } from 'react';

export default function QRBlock({ slug }: { slug: string }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(`${window.location.origin}/menu/${slug}`);
    }
  }, [slug]);

  const qrSrc = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        url
      )}`
    : '';

  return (
    <div className="flex flex-col items-center space-y-2">
      {qrSrc && (
        <>
          <img
            src={qrSrc}
            alt="QR Code"
            className="bg-white p-4 rounded-lg"
          />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-800 break-all"
          >
            Open menu: {url}
          </a>
        </>
      )}
    </div>
  );
}
