'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function QRPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [menuData, setMenuData] = useState<{
    restaurantName: string
    translations: Record<string, string>
  } | null>(null)
  const [activeLang, setActiveLang] = useState('en')

  useEffect(() => {
    if (!slug) return
    const stored = sessionStorage.getItem(`menu-${slug}`)
    if (!stored) {
      router.replace('/')
      return
    }
    setMenuData(JSON.parse(stored))
  }, [slug])

  if (!menuData) {
    return (
      <div className="p-10 text-center">
        Menu not found or session expired.<br/>Please go back and translate again.
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-4">{menuData.restaurantName}</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.keys(menuData.translations).map(lang => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            className={`px-4 py-2 rounded ${
              activeLang === lang ? 'bg-black text-white' : 'bg-gray-200'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
      <pre className="whitespace-pre-wrap leading-relaxed text-lg">
        {menuData.translations[activeLang]}
      </pre>
    </div>
  )
}
