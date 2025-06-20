// File: app/qr/[slug]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface MenuData {
  restaurantName: string
  translations: Record<string, string>
}

export default function QRPage() {
  // ← properly grab `slug` as string
  const params = useParams() as { slug: string }
  const slug = params.slug

  const router = useRouter()
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [activeLang, setActiveLang] = useState<string>('')

  useEffect(() => {
    if (!slug) return
    const raw = sessionStorage.getItem(`menu-${slug}`)
    if (!raw) {
      router.replace('/') 
      return
    }
    const parsed: MenuData = JSON.parse(raw)
    setMenuData(parsed)
    // default to first language
    setActiveLang(Object.keys(parsed.translations)[0] || '')
  }, [slug, router])

  if (!menuData) {
    return (
      <div className="p-10 text-center">
        Menu not found or session expired.<br/>
        Please go back and translate again.
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
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
      <pre className="whitespace-pre-wrap leading-relaxed text-lg">
        {menuData.translations[activeLang]}
      </pre>
    </div>
  )
}
