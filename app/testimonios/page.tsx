import { Quote, Star } from 'lucide-react'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'

function formatAuthorName(fullName: string) {
  const [firstName, ...surnames] = fullName.trim().split(/\s+/)
  const surnameInitial = surnames[0]?.[0]
  return surnameInitial ? `${firstName} ${surnameInitial}.` : firstName
}

function formatCourseSlug(slug: string) {
  return slug.split('-').filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

type TestimonialsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TestimonialsPage({ searchParams }: TestimonialsPageProps) {
  const params = await searchParams
  const courseIdValue = params.curso_id
  const courseId = typeof courseIdValue === 'string' ? courseIdValue.trim() : ''
  const supabase = await createClient()
  let courseSlug: string | null = null
  let courseTitle: string | null = null

  if (courseId) {
    const { data: course, error } = await supabase
      .from('cursos')
      .select('slug, titulo')
      .eq('id', courseId)
      .maybeSingle()

    if (error) throw new Error(`No se pudo encontrar el curso solicitado: ${error.message}`)
    courseSlug = course?.slug ?? null
    courseTitle = course?.titulo ?? null
  }

  const opinions: {
    id: string | number
    comentario: string | null
    nombre_autor: string | null
    curso_slug: string | null
    calificacion: number | null
  }[] = []
  const pageSize = 1000
  let start = 0
  let hasMoreOpinions = true

  while (hasMoreOpinions && (!courseId || courseSlug)) {
    let query = supabase
      .from('opiniones')
      .select('id, comentario, nombre_autor, curso_slug, calificacion')
      .order('fecha', { ascending: false })
    if (courseSlug) query = query.eq('curso_slug', courseSlug)
    const { data, error } = await query.range(start, start + pageSize - 1)

    if (error) throw new Error(`No se pudieron cargar los testimonios: ${error.message}`)

    opinions.push(...(data ?? []))
    hasMoreOpinions = (data?.length ?? 0) === pageSize
    start += pageSize
  }

  const courseSlugs = [...new Set(opinions.map((opinion) => opinion.curso_slug).filter((slug): slug is string => Boolean(slug)))]
  const courseTitles = new Map<string, string>()

  if (courseSlugs.length > 0) {
    const { data: courses, error } = await supabase.from('cursos').select('slug, titulo').in('slug', courseSlugs)
    if (error) throw new Error(`No se pudieron cargar los nombres de los cursos: ${error.message}`)
    for (const course of courses ?? []) {
      if (course.slug) courseTitles.set(course.slug, course.titulo ?? formatCourseSlug(course.slug))
    }
  }

  const testimonials = opinions.filter((opinion) => opinion.comentario).map((opinion, index) => ({
    ...opinion,
    id: String(opinion.id ?? `${opinion.curso_slug ?? 'opinion'}-${index}`),
    comentario: opinion.comentario as string,
    nombreAutor: opinion.nombre_autor?.trim() || 'Familia',
    cursoTitulo: courseTitles.get(opinion.curso_slug ?? '') ?? formatCourseSlug(opinion.curso_slug ?? ''),
    calificacion: Math.min(5, Math.max(0, Number(opinion.calificacion ?? 0))),
  }))

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <header className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#54745c]">Historias reales</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{courseId ? `Opiniones sobre ${courseTitle || 'este curso'}` : 'Voces de nuestra comunidad'}</h1>
        </header>
        {testimonials.length === 0 ? (
          <p className="py-12 text-center text-sm text-stone-500">Todavía no hay historias para mostrar.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((opinion) => (
              <Card key={opinion.id} className="rounded-3xl border-stone-200 bg-[#fbfaf8] shadow-none">
                <CardContent className="flex h-full flex-col p-7">
                  <Quote className="mb-5 text-[#d9a18e]" aria-hidden="true" />
                  <div className="mb-3 flex gap-0.5 text-[#d2a13b]" aria-label={`${opinion.calificacion} de 5 estrellas`}>
                    {Array.from({ length: 5 }, (_, index) => <Star key={index} className={`size-4 ${index < opinion.calificacion ? 'fill-current' : 'fill-none'}`} aria-hidden="true" />)}
                  </div>
                  <p className="flex-1 text-lg leading-8 text-stone-700">{opinion.comentario}</p>
                  <div className="mt-7 border-t border-stone-200 pt-5">
                    <p className="font-semibold">{formatAuthorName(opinion.nombreAutor)}</p>
                    <p className="mt-1 text-sm text-stone-500">Curso: {opinion.cursoTitulo}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
