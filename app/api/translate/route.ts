// app/api/translate/route.ts
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
              'You are a restaurant-menu translator. You’ll get a list of items in any delimited or tabular format. ' +
              'First extract the dish, description, and price columns, then output only those columns in a pipe-delimited list (`Dish|Description|Price`). ' +
              'No extra text, numbering, or follow-up questions.'
          },
          {
            role: 'user',
            content: `Translate this menu into ${lang.toUpperCase()}:

${text}`
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
  } catch (error: any) {
    console.error('Translate API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
