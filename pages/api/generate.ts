// pages/api/generate.ts
// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }

  const { menu, languages } = req.body
  if (!Array.isArray(menu) || !Array.isArray(languages) || menu.length === 0 || languages.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid menu or languages' })
  }

  try {
    const messages = [
      {
        role: 'system',
        content:
          'You are a JSON API. **Return ONLY** a JSON object (no prefixes or explanations). ' +
          'Format: { "<lang>": [ { "Dish Name": "...", "Description": "...", "Price": "..." }, … ] }'
      },
      {
        role: 'user',
        content: JSON.stringify({ menu, languages })
      }
    ]

    // @ts-ignore: bypass SDK overload type issues
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',      // or 'gpt-3.5-turbo'
      messages,
      temperature: 0
    })

    const raw = completion.choices?.[0]?.message?.content?.trim() || ''
    // Extract only the JSON substring between the first { and last }
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    const jsonText = start >= 0 && end >= 0 ? raw.slice(start, end + 1) : raw

    const translatedMenus = JSON.parse(jsonText)
    const slug = Math.random().toString(36).substring(2, 8)

    return res.status(200).json({ slug, translatedMenus })
  } catch (err: any) {
    console.error('🔴 GENERATE ERROR:', err)
    return res.status(500).json({
      error: err.message || 'Translation failed',
      details: err.response?.data || null
    })
  }
}
