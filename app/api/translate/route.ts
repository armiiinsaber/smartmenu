// app/api/translate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat";

const openai = new OpenAI();

/* ---------- helpers ---------- */
const generateSlug = () => Math.random().toString(36).slice(2, 8);
const LINES_PER_CHUNK = 50;
const chunk = <T,>(arr: T[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

/* ---------- route ---------- */
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

    /* ---------- 1. English pass-through ---------- */
    if (languages.includes("en")) translations.en = text.trim();

    /* ---------- 2. Build a list of unique MainCats ---------- */
    const englishMainCats = Array.from(
      new Set(rawLines.map((l) => l.split("|")[0].trim()).filter(Boolean))
    );

    /* ---------- 3. Translate everything except EN ---------- */
    const langsToTranslate = languages.filter((l) => l !== "en");

    await Promise.all(
      langsToTranslate.map(async (lang) => {
        /* 3-a. translate the distinct MainCats once */
        const mainCatPrompt: ChatCompletionMessageParam[] = [
          {
            role: "system",
            content: `
Translate the following menu section names into ${lang.toUpperCase()}.
Reply with one line per name in the same order, NO extra text.
            `.trim(),
          },
          {
            role: "user",
            content: englishMainCats.join("\n"),
          },
        ];

        const mcResp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: mainCatPrompt,
          temperature: 0,
          max_tokens: 200,
        });

        const translatedMainCats = mcResp.choices[0].message.content
          ?.trim()
          .split(/\r?\n/)
          .map((l) => l.trim()) ?? [];

        const mainCatMap = new Map<string, string>();
        englishMainCats.forEach((eng, idx) =>
          mainCatMap.set(eng, translatedMainCats[idx] || eng)
        );

        /* 3-b. translate the menu in safe chunks */
        const translatedChunks: string[] = [];

        for (const subset of chunks) {
          const chunkText = subset.join("\n");

          const messages: ChatCompletionMessageParam[] = [
            {
              role: "system",
              content: `
You are an expert restaurant-menu translator.

• Each line:  MainCat | Category | Dish | Description | Price
• Translate EVERY field EXCEPT the last Price.
• Keep exactly five "|" per line, preserve blank fields.
• Return lines in the same order, NO extra text.
            `.trim(),
            },
            {
              role: "user",
              content: `Translate into ${lang.toUpperCase()}:\n\n${chunkText}`,
            },
          ];

          const { choices } = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            temperature: 0,
            max_tokens: 3000,
          });

          /* 3-c. enforce consistent MainCat wording */
          const fixed = (choices[0].message.content ?? "")
            .trim()
            .split(/\r?\n/)
            .map((line) => {
              const [mc, ...rest] = line.split("|");
              const engKey = mc.trim();
              const safeMc = mainCatMap.get(engKey) ?? mc;
              return [safeMc, ...rest].join("|");
            })
            .join("\n");

          translatedChunks.push(fixed);
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
