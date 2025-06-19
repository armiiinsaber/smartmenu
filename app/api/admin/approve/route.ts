/* eslint-disable */ // @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { nanoid } from 'nanoid';

const supaAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!           // private key
);

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  const { id } = await req.json(); // queue row id
  const { data, error } = await supaAdmin
    .from('upload_queue')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { uploaded_csv, languages } = data;

  // --- translate via OpenAI (same logic you used before) ---
  const prompt = `
  Translate the following JSON menu into: ${languages.join(', ')}.
  Return ONLY valid JSON keyed by language code.

  ${JSON.stringify(uploaded_csv)}
  `;
  const chat = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages:[
      {role:'system', content:'Return ONLY JSON'},
      {role:'user', content: prompt}
    ],
    response_format:{type:'json_object'}
  });
  const translated = JSON.parse(chat.choices[0].message.content||'{}');

  // --- store in menus ---
  const slug = nanoid(8);
  const { error:insErr } = await supaAdmin.from('menus')
    .insert({ slug, languages, json_menu: translated });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });

  // --- mark queue row approved ---
  await supaAdmin.from('upload_queue')
    .update({ status:'approved', notes:null })
    .eq('id', id);

  return NextResponse.json({ slug });
}
