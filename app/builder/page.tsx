'use client'

import { useState } from 'react'

export default function BuilderPage() {
  const [restaurantName, setRestaurantName] = useState('')
  const [menuText, setMenuText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submit:', restaurantName, menuText)
    // you can replace this with your actual logic
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10 flex flex-col items-center justify-start">
      <h1 className="text-2xl font-bold mb-6 text-center">Upload Your Menu</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4"
      >
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
        ></textarea>

        <button
          type="submit"
          className="w-full py-3 bg-black text-white rounded-2xl font-medium hover:bg-gray-900 transition"
        >
          Submit
        </button>
      </form>
    </div>
  )
}
