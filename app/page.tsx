import { FeaturedCourse, LandingContent } from '@/components/landing-content'
import { SiteHeader } from '@/components/site-header'
import { createClient } from '@/utils/supabase/server'

function formatCourseSlug(slug: string) {
  return slug.split('-').filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: cursosDestacados } = await supabase.from('cursos').select('*').limit(3)
  const { data: opiniones } = await supabase
    .from('opiniones')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(3)

  const cursoSlugs = [...new Set((opiniones ?? [])
    .map((opinion) => opinion.curso_slug)
    .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0))]
  const titulosPorSlug = new Map<string, string>()

  if (cursoSlugs.length > 0) {
    const { data: cursos } = await supabase.from('cursos').select('slug, titulo').in('slug', cursoSlugs)
    for (const curso of cursos ?? []) {
      if (curso.slug) titulosPorSlug.set(curso.slug, curso.titulo ?? formatCourseSlug(curso.slug))
    }
  }

  const testimonials = (opiniones ?? [])
    .filter((opinion) => opinion.comentario)
    .map((opinion, index) => ({
      id: String(opinion.id ?? `${opinion.curso_slug ?? 'opinion'}-${index}`),
      comentario: String(opinion.comentario),
      nombre_autor: String(opinion.nombre_autor ?? 'Familia'),
      curso_titulo: titulosPorSlug.get(opinion.curso_slug ?? '') ?? formatCourseSlug(opinion.curso_slug ?? ''),
      calificacion: Number(opinion.calificacion ?? 0),
    }))
  const featuredCourses = (cursosDestacados ?? []) as FeaturedCourse[]

  return (
    <>
      <SiteHeader />
      <LandingContent testimonials={testimonials} courses={featuredCourses} />
    </>
  )
}