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
        // Cast to any so TypeScript won’t complain
        const messages = [
          {
            role: 'system',
            content:
              'You are an expert luxury menu translator. You will receive lines in the format:\n' +
              '`Category|Dish|Description|Price`\n\n' +
              '1. **Always translate** the first field (Category) into the target language—never leave it in English.\n' +
              '2. Translate the Dish and Description fields fully into the target language.\n' +
              '3. **Do NOT** modify the Price field; leave it exactly as provided.\n' +
              '4. Preserve **exactly one output line per input line**, in the same order.\n' +
              '5. Output only the translated, pipe-delimited lines—no numbering, bullets, or extra text.'
          },
          {
            role: 'user',
            content: `Translate the following menu items into ${lang.toUpperCase()}:\n\n${text}`
          }
        ] as any;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0,
        });

        translations[lang] = completion.choices?.[0].message?.content.trim() ?? '';
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
