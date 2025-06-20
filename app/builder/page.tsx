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
      } catch {
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
        window.location.href = `/qr/${data.slug}`
      } else {
        alert(data.error || 'Unexpected response')
      }
    } catch (err: any) {
      alert(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Your Menu</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <input
          type="text"
          placeholder="Restaurant Name"
          value={restaurantName}
          onChange={e => setRestaurantName(e.target.value)}
          className="w-full p-3 border rounded"
        />
        <textarea
          placeholder="Paste your menu here..."
          value={menuText}
          onChange={e => setMenuText(e.target.value)}
          rows={6}
          className="w-full p-3 border rounded resize-none"
        />
        <div className="grid grid-cols-2 gap-2">
          {['en','fr','es','de','zh','ar','hi','pt','ru','it'].map(lang => (
            <label key={lang} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={lang}
                checked={selectedLangs.includes(lang)}
                onChange={() =>
                  setSelectedLangs(prev =>
                    prev.includes(lang)
                      ? prev.filter(l => l !== lang)
                      : [...prev, lang]
                  )
                }
              />
              <span className="capitalize">{lang}</span>
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Translating…' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
