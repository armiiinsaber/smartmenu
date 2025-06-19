// File: app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Use the Supabase service role key for inserts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { raw, name, languages } = await req.json();
    if (!raw || !name || !Array.isArray(languages) || !languages.length) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Split into non-empty lines and dedupe
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const unique = Array.from(new Set(lines));

    // Translate each line for each language
    const translations: Record<string, string[]> = {};
    for (const lang of languages) {
      const prompt = `Translate the following menu lines into ${lang}, preserving formatting:\n\n${unique.join('\n')}`;
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim() || '';
      translations[lang] = text.split(/\r?\n/).map(l => l.trim());
    }

    // Reassemble full translations in original order
    const full: Record<string, string> = {};
    for (const lang of languages) {
      full[lang] = lines
        .map(line => {
          const idx = unique.indexOf(line);
          return translations[lang][idx] ?? line;
        })
        .join('\n');
    }

    // Persist to Supabase
    const slug = uuidv4().slice(0, 8);
    const { error } = await supabase
      .from('menus')
      .insert({ slug, name, translations: full, created_at: new Date().toISOString() });
    if (error) throw error;

    return NextResponse.json({ slug });
  } catch (err: any) {
    console.error('Translate API error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
