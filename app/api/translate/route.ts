// app/api/translate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat";

const openai = new OpenAI();

// split helper
const chunk = <T,>(arr: T[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

const generateSlug = () => Math.random().toString(36).slice(2, 8);
const LINES_PER_CHUNK = 50; // keeps each GPT call well under token limits

export async function POST(request: Request) {
  try {
    const { restaurantName, text, languages } = (await request.json()) as {
      restaurantName: string;
      text: string;
      languages: string[];
    };

    if (!restaurantName || !text || !languages?.length) {
      return NextResponse.json(
        { error: "Missing restaurantName, text, or languages" },
        { status: 400 }
      );
    }

    const slug = generateSlug();
    const translations: Record<string, string> = {};
    const lines = text.trim().split(/\r?\n/);
    const chunks = chunk(lines, LINES_PER_CHUNK);

    await Promise.all(
      languages.map(async (lang) => {
        const translatedChunks: string[] = [];

        for (const subset of chunks) {
          const chunkText = subset.join("\n");

          const messages: ChatCompletionMessageParam[] = [
            {
              role: "system",
              content: `
You are an expert restaurant-menu translator.

• Each line is:  MainCat | Category | Dish | Description | Price
• Translate EVERY field EXCEPT the last Price.
  – That includes MainCat and Category.
• If MainCat repeats (e.g., "Spirits"), translate it CONSISTENTLY on every row.
• Translate even UPPERCASE words; do not leave them in English unless they are proper names.
• Keep the exact pipe layout (5 “|” per line) and preserve blank fields.
• Return the lines in the original order with NO extra text.
            `.trim(),
            },
            {
              role: "user",
              content: `Translate the following into ${lang.toUpperCase()}:\n\n${chunkText}`,
            },
          ];

          const { choices } = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            temperature: 0,
            max_tokens: 3000,
          });

          translatedChunks.push(choices[0]?.message?.content?.trim() || "");
        }

        translations[lang] = translatedChunks.join("\n");
      })
    );

    return NextResponse.json({ slug, restaurantName, translations });
  } catch (err: any) {
    console.error("Translate API Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
