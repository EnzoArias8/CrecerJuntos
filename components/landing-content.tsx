import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Camera,
  MessageCircle,
  Quote,
  Star,
  Sparkles,
} from 'lucide-react'
import { CourseCard, type CourseCardData } from '@/components/course-card'
import { SiteFooter } from '@/components/site-footer'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LandingPreloader, NewsletterForm } from '@/components/landing-interactions'

export type LandingTestimonial = {
  id: string
  comentario: string
  nombre_autor: string
  curso_titulo: string
  calificacion: number
}

export type FeaturedCourse = CourseCardData

function formatAuthorName(fullName: string) {
  const [firstName, ...surnames] = fullName.trim().split(/\s+/)
  const surnameInitial = surnames[0]?.[0]
  return surnameInitial ? `${firstName} ${surnameInitial}.` : firstName
}

export function LandingContent({ testimonials, courses }: { testimonials: LandingTestimonial[]; courses: FeaturedCourse[] }) {
  return (
    <>
      <LandingPreloader />
      <main className="min-h-screen bg-stone-50 text-stone-800 transition-opacity duration-700">
        <section id="inicio" className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-8 sm:py-10 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-10">
          <div className="max-w-xl">
            <p className="mb-5 flex items-center gap-2 text-sm font-medium text-[#54745c]"><Sparkles /> Educación con calma y conexión</p>
            <h1 className="text-balance text-5xl font-semibold leading-[1.08] tracking-tight text-stone-800 sm:text-6xl">¡Hola! Somos <span className="text-[#b56f5d]">Rocío y Lucía</span></h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-stone-600">Somos psicopedagogas y acompañamos a familias que quieren comprender mejor a sus hijos, fortalecer sus aprendizajes y disfrutar más el camino de crecer juntos.</p>
            <div className="mt-9 flex flex-wrap items-center gap-4"><Link href="/cursos" className={buttonVariants({ className: 'rounded-full bg-[#b56f5d] px-7 py-6 text-base text-white shadow-sm hover:bg-[#9f5e4d]' })}>Ver cursos <ArrowRight data-icon="inline-end" /></Link><span className="text-sm text-stone-500">A tu ritmo · Desde casa</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-lg"><div className="absolute -inset-4 -z-10 rotate-3 rounded-[4rem] bg-[#ead9cc]" /><Image src="/portraits-psicopedagogas.png" alt="Rocío y Lucía, psicopedagogas, sonriendo juntas en su espacio de trabajo" width={720} height={850} priority className="h-[420px] w-full rounded-[3rem] object-cover shadow-xl sm:h-[500px]" /></div>
        </section>

        <section id="cursos" className="bg-[#f2eee8] px-5 py-8 lg:px-8 lg:py-10">
          <div className="mx-auto max-w-7xl"><div className="mx-auto mb-6 max-w-xl text-center"><h2 className="text-4xl font-semibold tracking-tight">Los más elegidos</h2><p className="mt-4 text-stone-600">Cursos breves y claros para acompañar cada etapa con más confianza.</p></div><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div></div>
        </section>

        <section id="testimonios" className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10"><div className="relative mx-auto mb-6 flex w-full max-w-7xl flex-col items-center text-center"><p className="text-sm font-medium uppercase tracking-[0.2em] text-[#54745c]">Historias reales</p><h2 className="mt-3 text-4xl font-semibold tracking-tight">Lo que dice nuestra comunidad</h2><Link href="/testimonios" className="mt-4 inline-flex items-center gap-1 self-end text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 xl:absolute xl:right-0 xl:bottom-1 xl:mt-0">Ver todas las historias <ArrowRight className="size-4" aria-hidden="true" /></Link></div><div className="grid gap-6 lg:grid-cols-3">{testimonials.map((opinion) => <Card key={opinion.id} className="rounded-3xl border-stone-200 bg-[#fbfaf8] shadow-none"><CardContent className="flex h-full flex-col p-7"><Quote className="mb-5 text-[#d9a18e]" /><div className="mb-3 flex gap-0.5 text-[#d2a13b]" aria-label={`${opinion.calificacion} de 5 estrellas`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`size-4 ${index < opinion.calificacion ? 'fill-current' : 'fill-none'}`} aria-hidden="true" />)}</div><p className="flex-1 text-lg leading-8 text-stone-700">{opinion.comentario}</p><div className="mt-7 border-t border-stone-200 pt-5"><p className="font-semibold">{formatAuthorName(opinion.nombre_autor)}</p><p className="mt-1 text-sm text-stone-500">Curso: {opinion.curso_titulo}</p></div></CardContent></Card>)}</div></section>

        <section id="comunidad" className="px-5 pb-8 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 rounded-[2.5rem] bg-[#f5e5df] px-7 py-12 text-center sm:px-12 lg:flex-row lg:text-left"><div><p className="text-sm font-medium uppercase tracking-[0.2em] text-[#b56f5d]">Estamos cerquita</p><h2 className="mt-3 text-4xl font-semibold tracking-tight">Únete a la comunidad</h2><p className="mt-4 max-w-xl text-stone-600">Sígueme en Instagram y YouTube para recibir ideas simples, consejos diarios y un espacio donde sentirte acompañado.</p></div><Button className="shrink-0 rounded-full bg-[#b56f5d] px-6 py-6 text-white hover:bg-[#9f5e4d]"><Camera data-icon="inline-start" /> Seguir en Instagram</Button></div></section>

        <section id="preguntas" className="border-t border-stone-200 bg-white px-5 py-8 lg:px-8"><div className="mx-auto flex max-w-3xl flex-col items-center text-center"><MessageCircle className="text-[#54745c]" /><h2 className="mt-4 text-3xl font-semibold">¡Sigamos en contacto!</h2><p className="mt-3 text-stone-600">Recibe novedades, recursos gratuitos y nuevas herramientas para tu familia.</p><NewsletterForm /></div></section>
        <SiteFooter />
      </main>
    </>
  )
}