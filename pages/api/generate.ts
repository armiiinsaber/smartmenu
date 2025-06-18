// pages/api/generate.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { menu, languages } = req.body;

  if (!menu || !languages || !Array.isArray(languages) || languages.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid menu or languages' });
  }

  // Mock translation logic: just append language code to dish name
  const translatedMenus = languages.reduce((acc: any, lang: string) => {
    acc[lang] = menu.map((item: any) => {
      return {
        ...item,
        'Dish Name': `${item['Dish Name']} (${lang})`,
        Description: `${item.Description} [Translated to ${lang}]`
      };
    });
    return acc;
  }, {});

  // Generate a fake slug (in production use UUID or DB-generated slug)
  const slug = Math.random().toString(36).substring(2, 8);

  // Return slug and translated menus
  return res.status(200).json({
    slug,
    translatedMenus
  });
}
