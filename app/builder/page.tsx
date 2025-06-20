// File: app/builder/page.tsx
'use client';

import React, { useState } from 'react';
import axios from 'axios';

export default function BuilderPage() {
  const [rawMenu, setRawMenu] = useState('');
  const [name, setName] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Top 10 languages in Toronto
  const allLanguages = [
    'English',
    'French',
    'Mandarin',
    'Cantonese',
    'Spanish',
    'Punjabi',
    'Arabic',
    'Tagalog',
    'Hindi',
    'Tamil'
  ];

  const handleCheckbox = (lang: string) => {
    setLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawMenu || !name || languages.length === 0) {
      setErrorMsg('Please fill in all fields and select at least one language.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await axios.post('/api/translate', { raw: rawMenu, name, languages });
      setSlug(res.data.slug);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const menuUrl = slug ? `${window.location.origin}/menu/${slug}` : '';

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      {!slug ? (
        <form onSubmit={handleSubmit}>
          <h1>Translate Your Menu</h1>

          <label>Menu (text or CSV):</label>
          <textarea
            value={rawMenu}
            onChange={e => setRawMenu(e.target.value)}
            rows={10}
            style={{ width: '100%' }}
            required
          />

          <label>Menu Name:</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%' }}
            required
          />

          <label>Target Languages:</label>
          <div style={{ border: '1px solid #ccc', borderRadius: 4, padding: '.5rem', maxHeight: 200, overflowY: 'auto' }}>
            {allLanguages.map(lang => (
              <div key={lang} style={{ marginBottom: '.25rem' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={languages.includes(lang)}
                    onChange={() => handleCheckbox(lang)}
                    style={{ marginRight: '.5rem' }}
                  />
                  {lang}
                </label>
              </div>
            ))}
          </div>

          {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

          <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Translating…' : 'Generate Menu'}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h2>Your menu is ready!</h2>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`} alt="QR" />
          <p><a href={menuUrl}>View live menu</a></p>
        </div>
      )}
    </div>
  );
}
