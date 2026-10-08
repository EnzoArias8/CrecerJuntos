import { CourseCard } from '@/components/course-card'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { createClient } from '@/utils/supabase/server'

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: cursos, error } = await supabase.from('cursos').select('*')

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-3 sm:pt-4 lg:px-8 lg:pb-24">
        <section aria-label="Catálogo de cursos" className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {error ? (
            <p role="alert" className="col-span-full py-10 text-center text-sm text-rose-700">No pudimos cargar los cursos.</p>
          ) : !cursos || cursos.length === 0 ? (
            <p className="col-span-full py-10 text-center text-sm text-stone-500">No hay cursos publicados aún</p>
          ) : cursos.map((curso) => <CourseCard key={curso.id} course={curso} />)}
        </section>

      </main>
      <SiteFooter />
    </div>
  )
}