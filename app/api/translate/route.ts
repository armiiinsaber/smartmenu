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
  try {
    const { raw, name, languages } = await req.json();
    if (!raw || !name || !Array.isArray(languages) || languages.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Build a single prompt that returns pure JSON
    const prompt = `
You are a JSON-only translator. Given a \"menu\" string and an array of \"languages\", output EXACTLY valid JSON in this form:

{
  "Spanish": "...translated menu here...",
  "French": "...translated menu here...",
  // etc.
}

Do not include any markdown fences or extra commentary—only the JSON object.

Here are the inputs:
menu: """${raw.replace(/\\/\"/g, '\\\\"')}"""
languages: ${JSON.stringify(languages)}

Translate now:
`;

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
    
    let translations: Record<string,string>;
    try {
      translations = JSON.parse(content);
    } catch (e) {
      console.error('Invalid JSON from OpenAI:', content);
      return NextResponse.json(
        { error: 'Translation response was not valid JSON' },
        { status: 500 }
      );
    }

    // Persist to Supabase
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
