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

  try {
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

    // Perform translations for each language
    const translations: Record<string, string> = {}
    for (const lang of targetLangs) {
      const aiRes = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful translator. Translate the following restaurant menu into ${lang}, preserving formatting and prices exactly as written.`,
          },
          {
            role: 'user',
            content: menuText,
          },
        ],
      })

      // coalesce null to empty string
      const translatedText = aiRes.choices[0].message.content ?? ''
      translations[lang] = translatedText
    }

    // Generate a short slug to retrieve later
    const slug = uuid().split('-')[0]

    // TODO: save { slug, restaurantName, translations } in your database

    return res.status(200).json({ slug, translations })
  } catch (err) {
    console.error('Translate API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
