// pages/api/generate.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }

  const { menu, languages } = req.body
  if (!Array.isArray(menu) || !Array.isArray(languages) || menu.length === 0 || languages.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid menu/languages' })
  }

  try {
    // Build a prompt listing all dishes
    const prompt = [
      { role: 'system', content: 'You are a JSON API: translate the provided menu items into the requested language. Return only valid JSON.' },
      {
        role: 'user',
        content: JSON.stringify({
          menu,
          languages
        })
      }
    ]

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',     // or 'gpt-3.5-turbo' if you prefer
      messages: prompt,
      temperature: 0
    })

    // We expect the assistant to reply with:
    // { "<lang>": [ { "Dish Name": "...", "Description": "...", "Price": "..." }, ... ], ... }
    const text = completion.data.choices[0].message?.content?.trim() || ''
    const translatedMenus = JSON.parse(text)

    // Generate a slug for sharing
    const slug = Math.random().toString(36).substring(2, 8)

    return res.status(200).json({ slug, translatedMenus })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: 'Translation failed' })
  }
}
