// IMPORTANT: Ensure this file is located at `app/api/translate/route.ts` in your project
// and that any other translate endpoints (e.g., pages/api or root api/) are removed.

// File: app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase service-role client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Handle CORS preflight (OPTIONS)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Allow': 'POST,OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Handle POST translation requests
export async function POST(req: NextRequest) {
  try {
    // CORS header for all responses
    const headers = new Headers({ 'Access-Control-Allow-Origin': '*' });

    // Parse and validate input
    const { raw, name, languages } = await req.json();
    if (!raw || !name || !Array.isArray(languages) || languages.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Invalid input' }), { status: 400, headers });
    }

    // Split into lines and remove empty entries
    const lines = raw.split(/\r?\n/).filter(Boolean);
    // Deduplicate to minimize API calls
    const unique = Array.from(new Set(lines));

    // Perform translations for each language
    const translations: Record<string, string[]> = {};
    for (const lang of languages) {
      const prompt = `Translate the following lines into ${lang}, preserving formatting:\n${unique.join('\n')}`;
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content?.trim() || '';
      translations[lang] = text.split(/\r?\n/).map(line => line.trim());
    }

    // Reassemble translations in the original order
    const full: Record<string, string> = {};
    for (const lang of languages) {
      full[lang] = lines.map(line => {
        const idx = unique.indexOf(line);
        return translations[lang][idx] ?? line;
      }).join('\n');
    }

    // Generate slug and insert into Supabase
    const slug = uuidv4().slice(0, 8);
    const { error } = await supabase
      .from('menus')
      .insert({ slug, name, translations: full, created_at: new Date().toISOString() });
    if (error) throw error;

    // Return the slug
    return new NextResponse(JSON.stringify({ slug }), { status: 200, headers });
  } catch (err: any) {
    console.error('[Translate API error]', err);
    const headers = new Headers({ 'Access-Control-Allow-Origin': '*' });
    return new NextResponse(JSON.stringify({ error: err.message || 'Server error' }), { status: 500, headers });
  }
}
