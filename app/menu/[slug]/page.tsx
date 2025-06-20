'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type TranslationsMap = Record<string, string>

export default function MenuPage() {
  // get the slug
  const { slug } = useParams() as { slug: string }

  // store the loaded data
  const [restaurantName, setRestaurantName] = useState('')
  const [translations, setTranslations] = useState<TranslationsMap>({})
  // which language is currently visible
  const [currentLang, setCurrentLang] = useState('en')
  // current page URL for the QR code
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (!slug) return
    // load from sessionStorage
    const stored = sessionStorage.getItem(`menu-${slug}`)
    if (stored) {
      const parsed = JSON.parse(stored) as {
        restaurantName: string
        translations: TranslationsMap
      }
      setRestaurantName(parsed.restaurantName)
      setTranslations(parsed.translations)
      // default to English if available
      setCurrentLang(parsed.translations.en ? 'en' : Object.keys(parsed.translations)[0])
    }
    // grab the current URL
    setUrl(window.location.href)
  }, [slug])

  // if nothing loaded yet
  if (!translations || Object.keys(translations).length === 0) {
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
      {/* Header with name + QR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-4xl font-bold mb-4 md:mb-0">{restaurantName}</h1>

        {url && (
          <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                url
              )}`}
              alt="QR code to this menu"
              className="w-32 h-32"
            />
          </div>
        )}
      </div>

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
