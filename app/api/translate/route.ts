// app/api/translate/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client (ensure OPENAI_API_KEY is set in your environment)
const openai = new OpenAI();

// Simple slug generator
const generateSlug = () => Math.random().toString(36).substring(2, 8);

export async function POST(request: Request) {
  const { restaurantName, text, languages } =
    (await request.json()) as {
      restaurantName: string;
      text: string;
      languages: string[];
    };

  const slug = generateSlug();
  const translations: Record<string, string> = {};

  await Promise.all(
    languages.map(async (lang) => {
      const messages = [
        {
          role: 'system',
          content:
            'You are a precise translation engine for restaurant menus. ' +
            'Receive lines formatted as "Dish|Description|Price" and output exactly the translated lines in the same format. ' +
            'Do not add extra text, numbering, or follow-up questions.'
        },
        {
          role: 'user',
          content: `Translate this menu into ${lang.toUpperCase()}:\n\n${text}`
        }
      ] as any;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0,
        max_tokens: 2000
      });

      const choice = completion.choices?.[0];
      translations[lang] = (choice?.message?.content ?? '').trim();
    })
  );

  return NextResponse.json({ slug, restaurantName, translations });
}
