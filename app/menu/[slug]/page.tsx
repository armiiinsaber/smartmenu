// pages/menu/[slug].tsx
import { GetServerSideProps } from 'next'
import { menuStore, MenuData } from '../../lib/menuStore'

interface Props {
  restaurantName: string
  translations: Record<string,string>
}

export default function MenuPage({ restaurantName, translations }: Props) {
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

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = ctx.params?.slug as string
  const data = menuStore.get(slug)

  if (!data) {
    return { notFound: true }
  }

  return {
    props: {
      restaurantName: data.restaurantName,
      translations: data.translations,
    },
  }
}
