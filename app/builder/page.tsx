'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function BuilderPage() {
  const [rawMenu, setRawMenu] = useState('');
  const [name, setName] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [menuUrl, setMenuUrl] = useState('');

  // Top 20 most-used languages in North America
  const allLanguages = [
    'English','Spanish','French','Chinese','Tagalog','Vietnamese',
    'Arabic','Korean','German','Russian','Portuguese','Hindi',
    'Italian','Polish','Urdu','Japanese','Persian','Dutch',
    'Greek','Gujarati'
  ];

  const handleCheckbox = (lang: string) => {
    setLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawMenu.trim() || !name.trim() || languages.length === 0) {
      setErrorMsg('Please fill all fields and select at least one language.');
      return;
    }

    setLoading(true);
    setSlug(null);
    setErrorMsg(null);

    try {
      // 🔥 YOUR REAL TRANSLATION CALL HERE instead of this stub:
      // const res = await fetch('/api/translate', { … })
      // const { slug: newSlug } = await res.json();

      // demo stub for slug:
      await new Promise(res => setTimeout(res, 1000));
      const newSlug = uuidv4().slice(0, 8);
      setSlug(newSlug);
    } catch (err: any) {
      console.error('Translate error:', err);
      setErrorMsg('Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✨ Build the FULL URL after we have a slug
  useEffect(() => {
    if (slug) {
      const origin = window.location.origin; 
      setMenuUrl(`${origin}/menu/${slug}`);
    }
  }, [slug]);

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      {!slug ? (
        <form onSubmit={handleSubmit}>
          <h1>Translate Your Menu</h1>

          <label>Menu (paste text or CSV):</label>
          <textarea
            value={rawMenu}
            onChange={e => setRawMenu(e.target.value)}
            rows={8}
            style={{ width: '100%', marginBottom: '0.5rem' }}
            required
          />

          <label>Restaurant Name:</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', marginBottom: '0.5rem' }}
            required
          />

          <label>Target Languages:</label>
          <div style={{
            border: '1px solid #ccc', borderRadius: 4,
            padding: '0.5rem', maxHeight: 200, overflowY: 'auto',
            marginBottom: '0.5rem'
          }}>
            {allLanguages.map(lang => (
              <div key={lang} style={{ marginBottom: '.25rem' }}>
                <label style={{ cursor: 'pointer' }}>
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

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '1rem', padding: '.5rem 1rem',
              background: '#000', color: '#fff', border: 'none',
              borderRadius: 4, cursor: 'pointer'
            }}
          >
            {loading ? 'Generating…' : 'Generate QR Code'}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2>Your Menu QR Code</h2>
          {menuUrl && (
            <>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`}
                alt="QR Code"
                style={{ background: '#fff', padding: '1rem' }}
              />
              <p style={{ marginTop: '1rem', wordBreak: 'break-all' }}>
                <a href={menuUrl} target="_blank" rel="noreferrer">
                  {menuUrl}
                </a>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
