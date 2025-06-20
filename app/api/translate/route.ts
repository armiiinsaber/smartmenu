// File: app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase with the service-role key
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

    // Craft a single prompt that asks explicitly for pure JSON
    const prompt = `
You are a JSON-only translator. You must reply with exactly valid JSON and nothing else.

Input:
{
  "menu": ${JSON.stringify(raw)},
  "languages": ${JSON.stringify(languages)}
}

Output should be a JSON object where each key is a language and each value is the translated menu string preserving line breaks.
`;

    // Single OpenAI call
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    const json = await openaiRes.json();
    const content = json.choices?.[0]?.message?.content?.trim() || '';

    // Try to parse directly—no code fences expected
    let translations: Record<string, string>;
    try {
      translations = JSON.parse(content);
    } catch (err) {
      console.error('Invalid JSON from OpenAI:', content);
      return NextResponse.json(
        { error: 'Translation response was not valid JSON' },
        { status: 500 }
      );
    }

    // Persist into Supabase
    const slug = uuidv4().slice(0, 8);
    const { error } = await supabase
      .from('menus')
      .insert({ slug, name, translations, created_at: new Date().toISOString() });
    if (error) throw error;

    return NextResponse.json({ slug });
  } catch (err: any) {
    console.error('Translate API error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
