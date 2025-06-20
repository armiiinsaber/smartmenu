'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function MenuPage() {
  const { slug } = useParams()
  const [translations, setTranslations] = useState<Record<string,string> | null>(null)
  const [restaurantName, setRestaurantName] = useState('')

  useEffect(() => {
    if (!slug) return
    const raw = sessionStorage.getItem(`menu-${slug}`)
    if (raw) {
      const data = JSON.parse(raw) as Record<string,string>
      setTranslations(data)
      // optionally set a name header if you passed it too
      // setRestaurantName(data.restaurantName)
    }
  }, [slug])

  if (!translations) {
    return <p className="p-6 text-center">Menu not found or session expired.</p>
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {Object.entries(translations).map(([lang, text]) => (
        <section key={lang} className="mb-8">
          <h2 className="text-2xl font-semibold capitalize mb-2">{lang}</h2>
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg shadow-sm">
            {text}
          </pre>
        </section>
      ))}
    </div>
  )
}
