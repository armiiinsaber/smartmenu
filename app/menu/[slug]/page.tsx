'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type TranslationsMap = Record<string, string>

export default function MenuPage() {
  // Assert slug is always a string
  const { slug } = useParams() as { slug: string }

  const [restaurantName, setRestaurantName] = useState<string>('')
  const [translations, setTranslations] = useState<TranslationsMap | null>(null)

  useEffect(() => {
    if (!slug) return
    const stored = sessionStorage.getItem(`menu-${slug}`)
    if (stored) {
      const parsed = JSON.parse(stored) as {
        restaurantName: string
        translations: TranslationsMap
      }
      setRestaurantName(parsed.restaurantName)
      setTranslations(parsed.translations)
    }
  }, [slug])

  if (!translations) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-gray-500">
          Menu not found or session expired. Please go back and translate again.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-bold mb-6">{restaurantName}</h1>

      {Object.entries(translations).map(([lang, text]) => (
        <section key={lang} className="mb-10">
          <h2 className="text-2xl font-semibold capitalize mb-2">{lang}</h2>
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg shadow-sm">
            {text}
          </pre>
        </section>
      ))}
    </div>
  )
}
