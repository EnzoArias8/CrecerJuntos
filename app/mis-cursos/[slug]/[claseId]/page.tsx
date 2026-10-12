import { notFound, redirect } from "next/navigation"

import { LearningPlayer } from "@/components/learning-player"
import { createClient } from "@/utils/supabase/server"

type CourseLesson = {
	id: string
	title: string
	description: string
	videoUrl: string
	moduleId: string
	moduleNumber: number
	lessonNumber: number
}

type CourseModule = {
	id: string
	title: string
	lessons: CourseLesson[]
}

function normalizeClassId(value: unknown) {
	const rawId = String(value ?? '')
	const candidate = rawId.startsWith('lesson-') ? rawId.slice('lesson-'.length) : rawId
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(candidate)
		? candidate.toLowerCase()
		: ''
}
export default async function LearningPage({ params }: { params: Promise<{ slug: string; claseId: string }> }) {
	const { slug, claseId } = await params
	if (!claseId || !claseId.trim()) notFound()
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) redirect('/login')

	const { data: curso } = await supabase.from('cursos').select('*').eq('slug', slug).single()
	if (!curso) notFound()

	const { data: acceso } = await supabase
		.from('accesos')
		.select('id')
		.eq('usuario_id', user.id)
		.eq('curso_id', curso.id)
		.eq('estado', 'activo')
		.limit(1)
		.maybeSingle()
	if (!acceso) redirect(`/cursos/${slug}`)

	const rawModules = Array.isArray(curso.temario)
		? curso.temario as Array<{ id?: string; title?: string; lessons?: unknown[] }>
		: []
	const modules: CourseModule[] = rawModules.map((module, moduleIndex) => ({
		id: String(module.id ?? `module-${moduleIndex + 1}`),
		title: String(module.title ?? `Módulo ${moduleIndex + 1}`),
		lessons: (Array.isArray(module.lessons) ? module.lessons : []).flatMap((lesson, lessonIndex) => {
			const lessonData = typeof lesson === 'string' ? { title: lesson } : lesson as Record<string, unknown>
			const id = normalizeClassId(lessonData.id)
			if (!id) return []

			return {
				id,
				title: String(lessonData.title ?? `Clase ${lessonIndex + 1}`),
				description: String(lessonData.description ?? ''),
				videoUrl: String(lessonData.videoUrl ?? lessonData.video_url ?? ''),
				moduleId: String(module.id ?? `module-${moduleIndex + 1}`),
				moduleNumber: moduleIndex + 1,
				lessonNumber: lessonIndex + 1,
			}
		}),
	}))
	const allLessons = modules.flatMap((module) => module.lessons)
	const normalizedClaseId = normalizeClassId(claseId)
	if (!normalizedClaseId || !allLessons.some((lesson) => lesson.id === normalizedClaseId)) notFound()
	if (claseId !== normalizedClaseId) redirect(`/mis-cursos/${slug}/${normalizedClaseId}`)

	const { data: progreso } = await supabase
		.from('progreso_clases')
		.select('*')
		.eq('usuario_id', user.id)
		.eq('curso_id', curso.id)
	const { data: existingReview, error: reviewError } = await supabase
		.from('opiniones')
		.select('id')
		.eq('usuario_id', user.id)
		.eq('curso_slug', slug)
		.limit(1)
		.maybeSingle()
	if (reviewError) throw new Error(`No se pudo verificar si ya existe una opinión: ${reviewError.message}`)

	const completedLessonIds = allLessons
		.filter((lesson) => (progreso ?? []).some((row) => {
			if (row.completada === false || row.estado === 'pendiente') return false
			const storedLessonId = String(row.clase_id ?? row.leccion_id ?? row.lesson_id ?? '')
			return storedLessonId === lesson.id
		}))
		.map((lesson) => lesson.id)

	const nombreCompleto = typeof user?.user_metadata?.nombre_completo === 'string'
		? user.user_metadata.nombre_completo
		: ''
	const initials = nombreCompleto
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0].toLocaleUpperCase())
		.join('') || 'U'

	return <LearningPlayer courseId={String(curso.id)} courseSlug={slug} courseTitle={String(curso.titulo ?? '')} classId={claseId} initials={initials} userId={user.id} hasExistingReview={Boolean(existingReview)} modules={modules} completedLessonIds={completedLessonIds} />
}