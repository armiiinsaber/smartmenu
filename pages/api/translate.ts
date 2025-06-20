// File: pages/api/translate.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const TOP_LANGUAGES = [
  'English', 'French', 'Spanish', 'Chinese', 'Punjabi',
  'Arabic', 'Tagalog', 'Italian', 'German', 'Urdu'
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, content, languages } = req.body;
  if (!name || !content || !languages || !Array.isArray(languages)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const translations: Record<string, string> = {};

    for (const lang of languages) {
      const prompt = `Translate the following restaurant menu into ${lang}. Format each item as:
Dish – Description – Price\n\nMenu:\n${content}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });

      translations[lang] = response.choices[0].message.content || '';
    }

    const slug = uuidv4();

    const { error } = await supabase.from('menus').insert([
      { name, slug, translations }
    ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save menu' });
    }

    res.status(200).json({ slug });
  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({ error: 'Translation failed' });
  }
}
