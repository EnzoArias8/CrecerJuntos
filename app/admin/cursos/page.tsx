import Link from 'next/link'
import { BookOpen, Pencil, Plus } from 'lucide-react'

import { DeleteCourseButton } from '@/components/DeleteCourseButton'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createClient } from '@/utils/supabase/server'

function formatPrice(value: number | string | null | undefined) {
  if (value == null || value === '') return '—'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(value))
}

export default async function AdminCoursesPage() {
  const supabase = await createClient()
  const { data: cursos, error } = await supabase.from('cursos').select('*, accesos(count)')

  return (
    <section>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-[#54745c]"><BookOpen className="size-4" /> CATÁLOGO EDUCATIVO</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-800 sm:text-[28px]">Gestión de Cursos</h1>
          <p className="mt-1.5 text-sm text-stone-500">Administra tus cursos, precios y publicaciones.</p>
        </div>
        <Link href="/admin/cursos/nuevo" className={buttonVariants({ className: 'h-10 w-fit rounded-lg bg-[#54745c] px-4 text-sm text-white shadow-sm hover:bg-[#45624c]' })}><Plus data-icon="inline-start" /> Agregar nuevo curso</Link>
      </div>

      <Card className="rounded-xl border-stone-200 bg-white py-0 shadow-sm">
        <Table>
          <TableHeader><TableRow className="hover:bg-transparent"><TableHead className="min-w-[230px] pl-5">Curso</TableHead><TableHead className="min-w-[140px]">Categoría</TableHead><TableHead className="min-w-[130px]">Precio</TableHead><TableHead className="min-w-[130px]">Ventas</TableHead><TableHead className="min-w-[130px]">Estado</TableHead><TableHead className="w-[110px] pr-5 text-right">Acciones</TableHead></TableRow></TableHeader>
          <TableBody>
            {(cursos ?? []).map((curso) => {
              const estado = String(curso.estado ?? 'Publicado')
              const titulo = String(curso.titulo ?? 'Curso sin título')
              return (
                <TableRow key={curso.id}>
                  <TableCell className="pl-5 font-medium text-stone-800">{titulo}</TableCell>
                  <TableCell className="text-stone-600">{curso.categoria ?? '—'}</TableCell>
                  <TableCell className="font-medium tabular-nums text-stone-700">{formatPrice(curso.precio_ars)}</TableCell>
                  <TableCell className="text-stone-600">{curso.accesos?.[0]?.count ?? 0}</TableCell>
                  <TableCell><Badge className={`rounded-full px-2.5 ${estado.toLowerCase() === 'publicado' ? 'bg-[#e7f0e7] text-[#456d4d]' : 'bg-[#f8efe3] text-[#9a6d30]'}`}>{estado}</Badge></TableCell>
                  <TableCell className="pr-5"><div className="flex items-center justify-end gap-3"><Link href={`/admin/cursos/${curso.id}/editar`} className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'size-8 text-stone-500 hover:bg-stone-100 hover:text-stone-800' })} aria-label={`Editar ${titulo}`} title="Editar"><Pencil /></Link><DeleteCourseButton id={curso.id} /></div></TableCell>
                </TableRow>
              )
            })}
            {(!cursos || cursos.length === 0) && <TableRow><TableCell colSpan={6} className="h-24 text-center text-sm text-stone-500">{error ? 'No pudimos cargar los cursos.' : 'No hay cursos publicados aún'}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
      <p className="mt-4 text-xs text-stone-400">{cursos?.length ?? 0} cursos en el catálogo.</p>

    </section>
  )
}