// File: app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase with service-role key
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

    // Single batch prompt
    const prompt = `You are a JSON translator. Given:
MENU_START
${raw}
MENU_END
LANGUAGES_START
${languages.join(',')}
LANGUAGES_END
Return ONLY valid JSON mapping each language to its translated menu, preserving line breaks.`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], temperature: 0 }),
    });
    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';

    // Extract JSON
    let jsonStart = content.indexOf('{');
    let jsonString = content;
    if (jsonStart !== -1) jsonString = content.slice(jsonStart);

    let translations: Record<string, string>;
    try {
      translations = JSON.parse(jsonString);
    } catch (e) {
      console.error('JSON parse error:', content);
      return NextResponse.json({ error: 'Invalid JSON from translator' }, { status: 500 });
    }

    // Insert
    const slug = uuidv4().slice(0, 8);
    const { error } = await supabase.from('menus').insert({ slug, name, translations, created_at: new Date().toISOString() });
    if (error) throw error;

    return NextResponse.json({ slug });
  } catch (err: any) {
    console.error('Translate API error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
