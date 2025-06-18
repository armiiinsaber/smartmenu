// pages/menu/[slug].tsx
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'

type MenuItem = {
  'Dish Name': string
  Description: string
  Price: string
}

export default function MenuPage() {
  const { query } = useRouter()
  const slug = query.slug as string
  const langsParam = (query.langs as string) || ''
  const dataParam = (query.data as string) || ''
  const [languages, setLanguages] = useState<string[]>([])
  const [menuData, setMenuData] = useState<Record<string, MenuItem[]>>({})
  const [activeLang, setActiveLang] = useState<string>('')

  useEffect(() => {
    if (!langsParam || !dataParam) return
    const langs = langsParam.split(',')
    const parsed = JSON.parse(decodeURIComponent(dataParam)) as Record<string, MenuItem[]>
    setLanguages(langs)
    setMenuData(parsed)
    setActiveLang(langs[0])
  }, [langsParam, dataParam])

  if (!slug || !languages.length) return <p>Loading menu…</p>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Menu: {slug}</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {languages.map((code) => (
          <button
            key={code}
            onClick={() => setActiveLang(code)}
            className={`px-4 py-2 rounded ${
              activeLang === code ? 'bg-black text-white' : 'bg-gray-200'
            }`}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 text-left">Dish Name</th>
            <th className="border border-gray-300 p-2 text-left">Description</th>
            <th className="border border-gray-300 p-2 text-left">Price</th>
          </tr>
        </thead>
        <tbody>
          {(menuData[activeLang] || []).map((item, idx) => (
            <tr key={idx}>
              <td className="border border-gray-300 p-2">{item['Dish Name']}</td>
              <td className="border border-gray-300 p-2">{item.Description}</td>
              <td className="border border-gray-300 p-2">{item.Price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
