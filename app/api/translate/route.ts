import { NextResponse } from 'next/server';
import OpenAI, { ChatCompletionRequestMessage } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI();

// Simple slug generator
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
        // 👇 Use the correct OpenAI message type
        const messages: ChatCompletionRequestMessage[] = [
          {
            role: 'system',
            content:
              'You are an expert restaurant-menu translator.\n' +
              '• Input format per line: `Category|Dish|Description|Price`.\n' +
              '• Translate all four fields into the target language, preserving the pipe delimiters.\n' +
              '• Do not drop, merge, reorder, or add lines—output exactly one translated line per input line.\n' +
              '• No numbering, bullets, or extra text—only the translated pipe-delimited lines.'
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
        });

        translations[lang] =
          completion.choices?.[0].message?.content.trim() || '';
      })
    );

    return NextResponse.json({ slug, restaurantName, translations });
  } catch (err: any) {
    console.error('Translate API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
