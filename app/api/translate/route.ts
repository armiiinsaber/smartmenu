// app/api/translate/route.ts
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
              'You are an expert restaurant-menu translator.\n' +
              '• Input format: `Category|Dish|Description|Price`, one item per line.\n' +
              '• Translate all four fields, preserving the pipe delimiters.\n' +
              '• Maintain exactly one output line per input line, in the same order.\n' +
              '• Do not add numbering, bullets, or any extra text.'
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

        // Fully guard every step before calling .trim()
        const content = completion.choices?.[0]?.message?.content;
        translations[lang] = content ? content.trim() : '';
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
