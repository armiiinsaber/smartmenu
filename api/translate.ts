// File: pages/api/translate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase with Service Role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

type Data = {
  slug?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { raw, name, languages } = req.body;
    if (!raw || !name || !Array.isArray(languages) || !languages.length) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Split into lines and dedupe
    const lines: string[] = raw.split(/\r?\n/).filter(Boolean);
    const unique = Array.from(new Set(lines));

    // Translate each unique line for each language
    const translations: Record<string, string[]> = {};
    for (const lang of languages) {
      const prompt = `Translate the following menu lines into ${lang}, preserving formatting:\n\n${unique.join('\n')}`;
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await openaiRes.json();
      const text: string = data.choices?.[0]?.message?.content?.trim() || '';
      translations[lang] = text.split(/\r?\n/).map(l => l.trim());
    }

    // Reassemble full translations
    const full: Record<string, string> = {};
    for (const lang of languages) {
      full[lang] = lines
        .map(line => {
          const idx = unique.indexOf(line);
          return translations[lang][idx] ?? line;
        })
        .join('\n');
    }

    // Persist
    const slug = uuidv4().slice(0, 8);
    const { error } = await supabase
      .from('menus')
      .insert({ slug, name, translations: full, created_at: new Date().toISOString() });
    if (error) throw error;

    return res.status(200).json({ slug });
  } catch (err: any) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
