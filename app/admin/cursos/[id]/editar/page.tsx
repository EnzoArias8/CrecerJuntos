import { notFound } from 'next/navigation'

import { CourseForm, type CourseFormInitialData, type CourseModuleDraft } from '@/app/admin/cursos/course-form'
import { createClient } from '@/utils/supabase/server'

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: curso } = await supabase.from('cursos').select('*').eq('id', resolvedParams.id).single()

  if (!curso) notFound()

  const initialData: CourseFormInitialData = {
    id: curso.id,
    name: String(curso.titulo ?? ''),
    category: String(curso.categoria ?? ''),
    price: String(curso.precio_ars ?? ''),
    priceUsd: String(curso.precio_usd ?? ''),
    imageUrl: String(curso.imagen_url ?? ''),
    shortDescription: String(curso.descripcion_corta ?? ''),
    description: String(curso.descripcion_completa ?? ''),
    learningObjectives: String(curso.que_aprenderan ?? ''),
    audience: String(curso.dirigido_a ?? ''),
    modality: String(curso.modalidad ?? ''),
    topics: String(curso.temas_principales ?? ''),
    instructors: Array.isArray(curso.instructores)
      ? curso.instructores.filter((instructor: unknown): instructor is string => typeof instructor === 'string')
      : [],
    modules: Array.isArray(curso.temario) ? curso.temario as CourseModuleDraft[] : [],
  }

  return <CourseForm title="Editar curso" submitLabel="Guardar cambios" initialData={initialData} />
}