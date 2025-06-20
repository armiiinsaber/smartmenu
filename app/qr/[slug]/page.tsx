'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import QRBlock from '../../../components/QRBlock';

export default function QRPage() {
  const { slug } = useParams() as { slug?: string };

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <p className="text-red-500">⚠️ Invalid or missing code</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
      <h1 className="text-xl font-semibold">Scan to View Menu</h1>
      <QRBlock slug={slug} />
    </main>
  );
}
