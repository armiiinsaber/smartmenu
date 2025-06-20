// File: pages/api/translate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Body = {
  raw: string;
  name: string;
  languages: string[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { raw, name, languages }: Body = req.body;
  if (!raw || !name || !Array.isArray(languages) || !languages.length) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  // Prepare OpenAI calls in parallel
  const results = await Promise.all(
    languages.map(async (lang) => {
      const prompt = `Translate the following restaurant menu into ${lang}. Preserve the format 'Dish – Description | Price', and keep line breaks:

${raw}`;

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
        }),
      });
      const json = await r.json();
      const translated = json.choices?.[0]?.message?.content?.trim() || raw;
      return { lang, translated };
    })
  );

  // Build translations object
  const translations: Record<string, string> = {};
  for (const { lang, translated } of results) {
    translations[lang] = translated;
  }

  // Persist
  const slug = uuidv4().slice(0, 8);
  const { error } = await supabase
    .from('menus')
    .insert({ slug, name, translations, created_at: new Date().toISOString() });
  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ slug });
}
