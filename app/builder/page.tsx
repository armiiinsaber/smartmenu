'use client'

import { useState } from 'react'

export default function BuilderPage() {
  const [restaurantName, setRestaurantName] = useState('')
  const [menuText, setMenuText] = useState('')
  const [selectedLang, setSelectedLang] = useState('en')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName,
          menuText,
          targetLang: selectedLang,
        }),
      })

      const data = await res.json()

      if (data?.slug) {
        window.location.href = `/menu/${data.slug}`
      } else {
        alert('Something went wrong.')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred while submitting.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10 flex flex-col items-center justify-start">
      <h1 className="text-2xl font-bold mb-6 text-center">Upload Your Menu</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <input
          type="text"
          placeholder="Restaurant Name"
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black shadow-sm"
        />

        <textarea
          placeholder="Paste your menu here..."
          value={menuText}
          onChange={(e) => setMenuText(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black shadow-sm resize-none"
        />

        <div className="grid grid-cols-2 gap-2">
          {['en', 'fr', 'es', 'de', 'fa', 'zh'].map((lang) => (
            <label key={lang} className="flex items-center space-x-2">
              <input
                type="radio"
                name="language"
                value={lang}
                checked={selectedLang === lang}
                onChange={() => setSelectedLang(lang)}
              />
              <span className="capitalize">{lang}</span>
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-black text-white rounded-2xl font-medium hover:bg-gray-900 transition"
          disabled={loading}
        >
          {loading ? 'Translating...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
