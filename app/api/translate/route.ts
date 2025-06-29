// app/api/translate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat";

const openai = new OpenAI();

// Max lines per GPT call — adjust if you like
const LINES_PER_CHUNK = 50;

// helper: simple slug
const generateSlug = () => Math.random().toString(36).slice(2, 8);

// helper: chunk an array
function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

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
        let translatedLines: string[] = [];

        // translate each chunk sequentially (keeps order)
        for (const subset of chunks) {
          const chunkText = subset.join("\n");

          const messages: ChatCompletionMessageParam[] = [
            {
              role: "system",
              content: `
You are an expert restaurant-menu translator.

• Each line looks like:  MainCat | Category | Dish | Description | Price
• Translate **every field except the final Price**.
• Keep the **exact same "|" layout** (five pipes per line), preserve blank fields.
• Return the lines in the same order, no extra text before or after.
            `.trim(),
            },
            {
              role: "user",
              content: `Translate the following menu lines into ${lang.toUpperCase()}:\n\n${chunkText}`,
            },
          ];

          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            temperature: 0,
            max_tokens: 3000,
          });

          const chunkOut =
            completion.choices?.[0]?.message?.content?.trim() ?? "";
          translatedLines.push(chunkOut);
        }

        translations[lang] = translatedLines.join("\n");
      })
    );

    return NextResponse.json({ slug, restaurantName, translations });
  } catch (error: any) {
    console.error("Translate API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
