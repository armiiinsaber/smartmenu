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

    // Batch prompt for JSON-only response
    const prompt = `You are a JSON generator. Given a menu and languages, output ONLY valid JSON.
{
  "languages": [${languages.map(l => `"${l}"`).join(', ')}],
  "menu": "${raw.replace(/"/g, '\\"')}"
}
Respond with a JSON object where each key is a language and the value is the translated menu preserving line breaks.`;

    // Single API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], temperature: 0, max_tokens: 2000 }),
    });
    const result = await response.json();
    let content: string = result.choices?.[0]?.message?.content || '';

    // Extract JSON from code fence if present
    const jsonMatch = content.match(/```(?:json\n)?([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : content.trim();

    let translations: Record<string, string>;
    try {
      translations = JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse JSON:', content);
      return NextResponse.json({ error: 'Translation response was not valid JSON' }, { status: 500 });
    }

    // Persist
    const slug = uuidv4().slice(0, 8);
    const { error } = await supabase.from('menus').insert({ slug, name, translations, created_at: new Date().toISOString() });
    if (error) throw error;

    return NextResponse.json({ slug });
  } catch (err: any) {
    console.error('Translate API error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
