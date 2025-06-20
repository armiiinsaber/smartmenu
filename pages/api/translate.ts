// File: pages/api/translate.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuid } from 'uuid'
import { OpenAI } from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
    const translations: Record<string,string> = {}
    await Promise.all(
      targetLangs.map(async (lang: string) => {
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
        translations[lang] = aiRes.choices?.[0]?.message?.content ?? ''
      })
    )

    const slug = uuid().split('-')[0]

    const { error } = await supabase
      .from('menus')
      .insert({
        slug,
        name: restaurantName,
        translations,
        languages: targetLangs,
        status: 'approved',
      })

    if (error) {
      console.error('Supabase insert error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ slug, translations })
  } catch (err: any) {
    console.error('Translate API error:', err)
    return res.status(500).json({ error: err.message })
  }
}
