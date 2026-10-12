import Image from 'next/image'

import { SiteHeader } from '@/components/site-header'
import { Card, CardContent } from '@/components/ui/card'

const professionals = [
  {
    name: 'Rocío Arias',
    role: 'Lic. en Psicopedagogía',
    image: '/rocio.jpg',
    description:
      'Acompaña a las familias a comprender mejor los procesos de aprendizaje y desarrollo de sus hijos, con herramientas cercanas para la vida cotidiana.',
  },
  {
    name: 'Lucía Sanmartino',
    role: 'Lic. en Psicopedagogía',
    image: '/lucia.jpg',
    description:
      'Comparte una mirada respetuosa y práctica sobre la crianza y el aprendizaje, para que cada familia encuentre recursos que pueda aplicar a su propio ritmo.',
  },
]

export default function QuienesSomosPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8 lg:py-20">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#54745c]">Crecer juntos</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Quiénes Somos</h1>
          <p className="mt-5 text-lg leading-8 text-stone-600">
            Somos profesionales apasionadas por acompañar a las familias. Creamos un espacio con ideas y herramientas
            para comprender mejor a los hijos, fortalecer sus aprendizajes y disfrutar el camino de crecer juntos.
          </p>
        </header>

        <section aria-label="Nuestro equipo" className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 md:gap-8">
          {professionals.map((professional) => (
            <Card key={professional.name} className="overflow-hidden rounded-3xl border-stone-200 bg-white py-0 shadow-sm">
              <div className="relative aspect-[4/3] bg-[#ead9cc]">
                <Image
                  src={professional.image}
                  alt={professional.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-semibold tracking-tight">{professional.name}</h2>
                <p className="mt-1 text-sm font-medium text-[#54745c]">{professional.role}</p>
                <p className="mt-4 leading-7 text-stone-600">{professional.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  )
}
