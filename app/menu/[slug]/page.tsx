// app/menu/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { menuStore, MenuData } from '../../../lib/menuStore'

interface PageProps {
  params: { slug: string }
}

export default function MenuPage({ params: { slug } }: PageProps) {
  // look up the menu in our in-memory store
  const data: MenuData | undefined = menuStore.get(slug)

  if (!data) {
    // if it doesn’t exist, render the built-in 404
    notFound()
  }

  const { restaurantName, translations } = data

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-bold mb-4">{restaurantName}</h1>

      {Object.entries(translations).map(([lang, text]) => (
        <section key={lang} className="mb-8">
          <h2 className="text-2xl font-semibold capitalize mb-2">{lang}</h2>
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg shadow-sm">
            {text}
          </pre>
        </section>
      ))}
    </div>
  )
}
