// File: app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// OpenAI and Supabase keys from env
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { raw, name, languages } = await req.json();
    if (!raw || !name || !Array.isArray(languages) || languages.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Split raw input into lines
    const lines = raw.split(/\r?\n/).filter(line => line.trim());

    // Deduplicate lines to reduce API calls
    const unique = Array.from(new Set(lines));

    // Call OpenAI for each language
    const translations: Record<string, string[]> = {};
    for (const lang of languages) {
      const prompt = `Translate the following menu lines into ${lang}, preserving formatting:\n\n${unique.join('\n')}`;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim() || '';
      // Split translated block back into array
      translations[lang] = text.split(/\r?\n/).map(l => l.trim());
    }

    // Reassemble per-language full menu (in original order)
    const fullTranslations: Record<string, string> = {};
    for (const lang of languages) {
      fullTranslations[lang] = lines.map(line => {
        const idx = unique.indexOf(line);
        return translations[lang][idx] || line;
      }).join('\n');
    }

    // Generate slug
    const slug = uuidv4().slice(0, 8);

    // Insert into Supabase
    const { error } = await supabase.from('menus').insert({
      slug,
      name,
      translations: fullTranslations,
      created_at: new Date().toISOString(),
    });
    if (error) throw error;

    return NextResponse.json({ slug });
  } catch (err: any) {
    console.error('Translate API error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
