// pages/api/translate.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuid } from 'uuid'
import { OpenAI } from 'openai'

const openai = new OpenAI()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { restaurantName, menuText, targetLangs } = req.body

  if (
    !restaurantName ||
    !menuText ||
    !Array.isArray(targetLangs) ||
    targetLangs.length === 0
  ) {
    return res
      .status(400)
      .json({ error: 'Missing fields or no languages selected' })
  }

  try {
    // Build an array of promises for each language
    const translatePromises = targetLangs.map(async (lang: string) => {
      const aiRes = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Translate this restaurant menu into ${lang}, preserving formatting and prices exactly as written.`,
          },
          { role: 'user', content: menuText },
        ],
      })
      // coalesce null => ''
      const text = aiRes.choices[0].message.content ?? ''
      return { lang, text }
    })

    // Run all translations in parallel
    const results = await Promise.all(translatePromises)

    // Reduce into a map
    const translations: Record<string, string> = {}
    for (const { lang, text } of results) {
      translations[lang] = text
    }

    const slug = uuid().split('-')[0]

    return res.status(200).json({ slug, translations })
  } catch (err) {
    console.error('Translate API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
