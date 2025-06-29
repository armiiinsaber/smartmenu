// app/api/translate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat";

const openai = new OpenAI();

/* ───────── helpers ───────── */
const generateSlug = () => Math.random().toString(36).slice(2, 8);
const LINES_PER_CHUNK = 50; // ≤50 lines per GPT call = safe token usage
const chunk = <T,>(arr: T[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

/* ───────── route ───────── */
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
    const rawLines = text.trim().split(/\r?\n/);
    const chunks = chunk(rawLines, LINES_PER_CHUNK);

    /* ---- 1. keep EN untouched ---- */
    if (languages.includes("en")) {
      translations.en = text.trim(); // store original
    }

    /* ---- 2. translate all other languages ---- */
    const langsToTranslate = languages.filter((l) => l !== "en");

    await Promise.all(
      langsToTranslate.map(async (lang) => {
        const translatedChunks: string[] = [];

        for (const subset of chunks) {
          const chunkText = subset.join("\n");

          const messages: ChatCompletionMessageParam[] = [
            {
              role: "system",
              content: `
You are an expert restaurant-menu translator.

• Each line:  MainCat | Category | Dish | Description | Price
• Translate EVERY field except the final Price.
• If MainCat repeats (e.g., "Spirits"), translate it CONSISTENTLY across rows.
• Translate even UPPERCASE words; don't leave English unless it's a proper name.
• Keep exactly five "|" per line and preserve blank fields (e.g., " |  |").
• Return lines in the same order with NO extra text before or after.
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
