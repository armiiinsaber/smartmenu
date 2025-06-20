'use client'

import { useState } from 'react'

export default function BuilderPage() {
  const [restaurantName, setRestaurantName] = useState('')
  const [menuText, setMenuText] = useState('')
  const [selectedLangs, setSelectedLangs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    if (!restaurantName.trim() || !menuText.trim() || selectedLangs.length === 0) {
      alert('Please fill all fields and select at least one language.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName,
          menuText,
          targetLangs: selectedLangs,
        }),
      })

      const text = await res.text()
      let data: any
      try {
        data = JSON.parse(text)
      } catch (err) {
        console.error('Non-JSON response from /api/translate:', text)
        alert(text)
        setLoading(false)
        return
      }

      if (data.slug && data.translations) {
        sessionStorage.setItem(
          `menu-${data.slug}`,
          JSON.stringify({
            restaurantName,
            translations: data.translations,
          })
        )
        // ← Redirect to the QR code stage instead of the menu
        window.location.href = `/qr/${data.slug}`
      } else {
        console.error('Error JSON from /api/translate:', data)
        alert(data.error || JSON.stringify(data))
      }
    } catch (err: any) {
      console.error('Fetch failed:', err)
      alert(err.message || 'Network or server error')
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
                type="checkbox"
                value={lang}
                checked={selectedLangs.includes(lang)}
                onChange={() =>
                  setSelectedLangs((prev) =>
                    prev.includes(lang)
                      ? prev.filter((l) => l !== lang)
                      : [...prev, lang]
                  )
                }
                className="h-4 w-4"
              />
              <span className="capitalize">{lang}</span>
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black text-white rounded-2xl font-medium hover:bg-gray-900 transition disabled:opacity-50"
        >
          {loading ? 'Translating...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
