'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type TranslationsMap = Record<string, string>

export default function MenuPage() {
  const { slug } = useParams() as { slug: string }

  const [restaurantName, setRestaurantName] = useState('')
  const [translations, setTranslations] = useState<TranslationsMap>({})
  const [currentLang, setCurrentLang] = useState('en')

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
      setCurrentLang(
        parsed.translations.en ? 'en' : Object.keys(parsed.translations)[0]
      )
    }
  }, [slug])

  if (!translations || !Object.keys(translations).length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-gray-500">
          Menu not found or session expired. Please go back and translate again.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      {/* Header with just the restaurant name */}
      <h1 className="text-4xl font-bold mb-8">{restaurantName}</h1>

      {/* Language buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.keys(translations).map((lang) => (
          <button
            key={lang}
            onClick={() => setCurrentLang(lang)}
            className={`px-4 py-2 rounded-2xl font-medium transition 
              ${
                currentLang === lang
                  ? 'bg-black text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Single menu view */}
      <div className="bg-gray-50 p-8 rounded-2xl shadow-lg">
        <pre className="whitespace-pre-wrap text-gray-800 text-lg">
          {translations[currentLang]}
        </pre>
      </div>
    </div>
  )
}

