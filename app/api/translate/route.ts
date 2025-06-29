// app/api/translate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat";

const openai = new OpenAI();

// quick slug helper
const generateSlug = () => Math.random().toString(36).slice(2, 8);

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

    await Promise.all(
      languages.map(async (lang) => {
        /* ---------- GPT prompt ---------- */
        const messages: ChatCompletionMessageParam[] = [
          {
            role: "system",
            content: `
You are an expert restaurant-menu translator.
• Each input line looks like:  MainCat | Category | Dish | Description | Price
• Translate every field EXCEPT the final Price.
• Keep **exactly the same number and order of "|"** (five pipes per line).
• Preserve blank fields such as " |  |".
• Return the lines in the same order, with no extra text.
            `.trim(),
          },
          {
            role: "user",
            content: `Translate the following menu into ${lang.toUpperCase()}:\n\n${text}`,
          },
        ];

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
          temperature: 0,
          max_tokens: 3000,
        });

        translations[lang] =
          completion.choices?.[0]?.message?.content?.trim() ?? "";
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
