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

  // Top 20 most-used languages in North America
  const allLanguages = [
    'English',
    'Spanish',
    'French',
    'Chinese',
    'Tagalog',
    'Vietnamese',
    'Arabic',
    'Korean',
    'German',
    'Russian',
    'Portuguese',
    'Hindi',
    'Italian',
    'Polish',
    'Urdu',
    'Japanese',
    'Persian',
    'Dutch',
    'Greek',
    'Gujarati'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSlug(null);
    setErrorMsg(null);

    try {
      const res = await axios.post('/api/translate', {
        raw: rawMenu,
        name,
        languages
      });
      setSlug(res.data.slug);
    } catch (err: any) {
      console.error('Translate error:', err);
      const msg = err.response?.data?.error || err.message || 'Unknown error';
      setErrorMsg(msg);
      alert(`Translation failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // Determine origin (for Vercel or localhost)
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const menuUrl = slug ? `${origin}/menu/${slug}` : '';

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      {!slug ? (
        <form onSubmit={handleSubmit}>
          <h1>Translate Your Menu</h1>

          <label>Menu (paste text or CSV):</label>
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
          <select
            multiple
            value={languages}
            onChange={e => {
              const opts = Array.from(e.target.selectedOptions, o => o.value);
              setLanguages(opts);
            }}
            style={{ width: '100%', height: 200 }}
            required
          >
            {allLanguages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          {errorMsg && (
            <p style={{ color: 'red', marginTop: '0.5rem' }}>{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
          >
            {loading ? 'Translating…' : 'Generate Menu'}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h2>Your menu is ready!</h2>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`}
            alt="QR Code"
          />
          <p>
            <a href={`/menu/${slug}`}>View your live menu</a>
          </p>
        </div>
      )}
    </div>
  );
}
