import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

const generateSlug = () => Math.random().toString(36).substring(2, 8);

export async function POST(request: Request) {
  try {
    const { restaurantName, text, languages } = (await request.json()) as {
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
              '• Translate all four fields into the target language, preserving the pipe delimiters.\n' +
              '• Do not drop, merge, or reorder lines—output exactly the same number of lines as input.\n' +
              '• Output only the translated lines, one per input line, with no numbering or extra text.'
          },
          {
            role: 'user',
            content: `Translate this menu into ${lang.toUpperCase()}:\n\n${text}`
          }
        ];

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0,
          max_tokens: 2000,
        });

        translations[lang] = completion.choices?.[0].message?.content.trim() || '';
      })
    );

    return NextResponse.json({ slug, restaurantName, translations });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
