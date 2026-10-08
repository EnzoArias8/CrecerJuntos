import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock3 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export type CourseCardData = {
  id: string | number
  slug: string
  titulo: string
  descripcion_corta: string | null
  precio_ars: number | string | null
  imagen_url: string | null
  categoria: string | null
  duracion?: string | null
}

function formatPrice(value: number | string | null) {
  if (value == null || value === '') return 'Consultar'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(value))
}

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Card className="h-full flex-col overflow-hidden rounded-2xl border-stone-200 bg-white py-0 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#ead9cc]">
        {course.imagen_url && <Image src={course.imagen_url} alt={course.titulo} fill unoptimized sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition-transform duration-500 hover:scale-[1.03]" />}
        <Badge className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[#54745c] shadow-sm hover:bg-white">{course.categoria ?? 'Curso'}</Badge>
      </div>
      <div className="flex flex-1 flex-col">
        <CardHeader className="gap-2 px-4 pb-0 pt-3 sm:px-5">
          <h2 className="text-lg font-semibold leading-snug text-stone-800">{course.titulo || 'Curso sin título'}</h2>
          <p className="line-clamp-5 text-sm leading-5 text-stone-600">{course.descripcion_corta ?? 'Conoce el contenido y aprende a tu ritmo.'}</p>
        </CardHeader>
        <div className="mt-2 flex items-center gap-2 px-4 text-xs text-stone-500 sm:px-5"><Clock3 className="size-4 text-[#54745c]" /> {course.duracion ?? 'A tu ritmo'}</div>
      </div>
      <CardContent className="mt-auto flex flex-col px-4 pb-3 pt-0 sm:px-5">
        <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
          <div><p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">Acceso completo</p><p className="mt-0.5 text-lg font-semibold tabular-nums text-stone-800">{formatPrice(course.precio_ars)}</p></div>
          <Link href={`/cursos/${course.slug}`} className={buttonVariants({ className: 'h-9 rounded-lg bg-[#C07A60] px-3 text-sm text-white hover:bg-[#a9634d]' })}>Ver detalles <ArrowRight data-icon="inline-end" /></Link>
        </div>
      </CardContent>
    </Card>
  )
}
