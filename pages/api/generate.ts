// pages/api/generate.ts
// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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
      { role: 'system', content: 'Translate the JSON menu as described.' },
      { role: 'user', content: JSON.stringify({ menu, languages }) }
    ]
    // @ts-ignore
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0
    })
    const text = completion.choices?.[0]?.message?.content?.trim() || ''
    const translatedMenus = JSON.parse(text)
    const slug = Math.random().toString(36).substring(2, 8)
    return res.status(200).json({ slug, translatedMenus })
  } catch (err: any) {
    console.error('🔴 GENERATE ERROR:', err)
    // return full error to client
    return res.status(500).json({
      error: err.message || 'Unknown',
      details: err.response?.data || err
    })
  }
}
