'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function QRPage() {
  const { slug } = useParams() as { slug: string }
  const [url, setUrl] = useState('')
  const router = useRouter()

  useEffect(() => {
    setUrl(window.location.origin + `/menu/${slug}`)
  }, [slug])

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold mb-4 text-center">
        Scan to view your menu
      </h1>

      {url && (
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm mb-6">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
              url
            )}`}
            alt="QR code to your menu"
            className="w-48 h-48"
          />
        </div>
      )}

      <button
        onClick={() => router.push(`/menu/${slug}`)}
        className="px-6 py-3 bg-black text-white rounded-2xl font-medium hover:bg-gray-900 transition"
      >
        Continue to Menu
      </button>
    </div>
  )
}
