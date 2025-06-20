// File: app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase service-role client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const { raw, name, languages } = await req.json();
    if (!raw || !name || !Array.isArray(languages) || languages.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400, headers });
    }

    // Prepare prompt for batch translation
    const prompt = `
You are a translation assistant. Translate the following menu into these languages: ${languages.join(', ')}.
Return a JSON object where each key is the language name and each value is the full translated menu text, preserving line breaks.

Menu:
${raw}
`;

    // Single API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      }),
    });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    let translations: Record<string,string>;
    try {
      translations = JSON.parse(content || '{}');
    } catch (e) {
      console.error('Failed to parse translations JSON', content);
      throw new Error('Translation response was not valid JSON');
    }

    // Persist to Supabase
    const slug = uuidv4().slice(0, 8);
    const { error } = await supabase
      .from('menus')
      .insert({ slug, name, translations, created_at: new Date().toISOString() });
    if (error) throw error;

    return NextResponse.json({ slug }, { status: 200, headers });
  } catch (err: any) {
    console.error('Translate API error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500, headers });
  }
}
