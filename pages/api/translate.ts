// File: pages/api/translate.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: true,
  },
};

type MenuInput = {
  raw: string;
  name: string;
  languages: string[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { raw, name, languages } = req.body as MenuInput;

  if (!raw || !name || !Array.isArray(languages) || languages.length === 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const lines = raw.split(/\r?\n/).filter(Boolean);
  const unique = Array.from(new Set(lines));

  const prompt = `
You are a professional restaurant menu translator. 
Translate the following menu into the following ${languages.length} languages: ${languages.join(', ')}.
Keep the menu structure and formatting clean and elegant.

Each line in the output should follow this format:
"Dish Name | Description | Price"

If there is no description, skip that part but keep the bars:
"Dish Name || $12"

Here is the menu in English:
${unique.join('\n')}

Return a JSON object where each key is the language and the value is the translated array of lines.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a professional translator and menu formatter.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 3000,
      }),
    });

    const result = await response.json();

    const content = result?.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    const parsed = JSON.parse(content);

    return res.status(200).json({
      name,
      translations: parsed,
    });
  } catch (err) {
    console.error('Translation error:', err);
    return res.status(500).json({ error: 'Translation failed', details: (err as Error).message });
  }
}
