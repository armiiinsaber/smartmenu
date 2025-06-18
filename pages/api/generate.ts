// pages/api/generate.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'    // default import for v4+

// Initialize the client
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
    // Prompt the model to translate the entire menu JSON
    const messages = [
      {
        role: 'system',
        content:
          'You are a JSON API. Translate the provided menu items into each requested language and return ONLY valid JSON in the format { "<lang>": [ { "Dish Name": "...", "Description": "...", "Price": "..." }, ... ] }.'
      },
      {
        role: 'user',
        content: JSON.stringify({ menu, languages })
      }
    ]

    // Call the newer v4 SDK
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',      // or 'gpt-3.5-turbo'
      messages,
      temperature: 0
    })

    // Extract and parse the JSON response
    const text = completion.choices[0]?.message?.content?.trim() || ''
    const translatedMenus = JSON.parse(text)

    // Generate a random slug
    const slug = Math.random().toString(36).substring(2, 8)

    return res.status(200).json({ slug, translatedMenus })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: 'Translation failed' })
  }
}
