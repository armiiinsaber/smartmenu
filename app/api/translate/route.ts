import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client (ensure OPENAI_API_KEY is set in your environment)
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
              'You are a luxury-restaurant-menu translator. You’ll receive lines in the format `Category|Dish|Description|Price`.\n' +
              'Translate **all four** fields into the target language, preserving the pipe-delimited order `Category|Dish|Description|Price`.\n' +
              '- Do not add or remove columns\n' +
              '- Do not add numbering, bullets, or any extra text\n' +
              '- Only output the translated lines, one per item'
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
