import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client (ensure OPENAI_API_KEY is set)
const openai = new OpenAI();

// Simple slug generator
const generateSlug = () => Math.random().toString(36).substring(2, 8);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurantName, text, languages } = body as {
      restaurantName: string;
      text: string;
      languages: string[];
    };

    if (!restaurantName || !text || !languages?.length) {
      return NextResponse.json(
        { error: 'Missing restaurantName, text, or languages' },
        { status: 400 }
      );
    }

    const slug = generateSlug();
    const translations: Record<string, string> = {};

    await Promise.all(
      languages.map(async (lang) => {
        const messages = [
          {
            role: 'system',
            content:
              'You are a luxury-restaurant-menu translator. You’ll receive lines in the format:\n' +
              '`Category|Dish|Description|Price`\n\n' +
              '1. **Translate only** the Category, Dish, and Description fields into the target language.\n' +
              '2. **Do NOT** translate, alter, or localize the Price field — leave it exactly as provided (e.g. `$9 each`).\n' +
              '3. Output only the translated lines, **pipe-delimited** in the same order: `Category|Dish|Description|Price`.\n' +
              '4. Do not add numbering, bullets, or any other text.'
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
          max_tokens: 2000,
        });

        const choice = completion.choices?.[0];
        translations[lang] = (choice?.message?.content ?? '').trim();
      })
    );

    return NextResponse.json({ slug, restaurantName, translations });
  } catch (error: any) {
    console.error('Translate API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
