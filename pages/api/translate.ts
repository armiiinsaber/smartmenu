// pages/api/translate.ts
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Initialize OpenAI client (ensure OPENAI_API_KEY is set in your environment)
const openai = new OpenAI();

// Simple slug generator
function generateSlug() {
  return Math.random().toString(36).substring(2, 8);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { restaurantName, text, languages } = req.body as {
    restaurantName: string;
    text: string;
    languages: string[];
  };

  const slug = generateSlug();
  const translations: Record<string, string> = {};

  // Parallel translation calls
  await Promise.all(
    languages.map(async (lang) => {
      // Define messages with required type casting
      const messages = [
        {
          role: 'system',
          content:
            'You are a precise translation engine for restaurant menus. ' +
            'Receive lines formatted as "Dish|Description|Price" and output exactly the translated lines in the same format. ' +
            'Do not add extra text, numbering, or follow-up questions.'
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
        max_tokens: 2000
      });

      // Store trimmed translated content
      translations[lang] =
        completion.choices?.[0]?.message?.content.trim() || '';
    })
  );

  // Return slug, original name, and translations
  return res.status(200).json({ slug, restaurantName, translations });
}
