import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuid } from 'uuid'
import { OpenAI } from 'openai'
import { menuStore, MenuData } from '../../lib/menuStore'

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

    // Translate each language
    const translations: Record<string,string> = {}
    for (const lang of targetLangs) {
      const aiRes = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Translate this menu into ${lang}, preserving formatting and prices.`,
          },
          { role: 'user', content: menuText },
        ],
      })
      translations[lang] = aiRes.choices[0].message.content ?? ''
    }

    const slug = uuid().split('-')[0]
    // store for later
    const data: MenuData = { restaurantName, translations }
    menuStore.set(slug, data)

    return res.status(200).json({ slug })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
