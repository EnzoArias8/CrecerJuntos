import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, BookOpen, LayoutGrid } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress, ProgressTrack } from "@/components/ui/progress"

export const dynamic = 'force-dynamic'

export default async function MisCursosPage({ searchParams }: { searchParams: Promise<{ status?: string; external_reference?: string }> }) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) redirect('/login')
	const { status, external_reference: cursoId } = await searchParams

	if (status === 'approved' && cursoId) {
		const { data: accesoExistente, error: consultaError } = await supabase
			.from('accesos')
			.select('id')
			.eq('usuario_id', user.id)
			.eq('curso_id', cursoId)
			.limit(1)
			.maybeSingle()

		if (!consultaError && !accesoExistente) {
			await supabase.from('accesos').insert({
				usuario_id: user.id,
				curso_id: cursoId,
				estado: 'activo',
				monto_abonado: 24900,
			})
		}
	}
	const { data: accesos } = await supabase
		.from('accesos')
		.select('id, cursos(*)')
		.eq('usuario_id', user.id)
		.eq('estado', 'activo')
	const { data: progresoClases } = await supabase
		.from('progreso_clases')
		.select('*')
		.eq('usuario_id', user.id)

	const normalizeLessonId = (lesson: unknown, fallbackId: string) => {
		if (typeof lesson === 'string') return lesson || fallbackId
		if (lesson && typeof lesson === 'object') {
			const record = lesson as Record<string, unknown>
			const candidate = String(record.id ?? record.sourceId ?? record.lesson_id ?? record.clase_id ?? '')
			return candidate || fallbackId
		}
		return fallbackId
	}

	const getFirstLessonId = (temario: unknown): string | null => {
		const modules = Array.isArray(temario) ? temario as Array<{ lessons?: unknown[] }> : []
		for (const module of modules) {
			const lessons = Array.isArray(module.lessons) ? module.lessons : []
			for (const lesson of lessons) {
				if (!lesson || typeof lesson !== 'object') continue
				const record = lesson as Record<string, unknown>
				const lessonId = String(record.id ?? record.sourceId ?? record.lesson_id ?? record.clase_id ?? '').trim()
				if (lessonId.startsWith('lesson-')) continue
				if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lessonId)) return lessonId
			}
		}
		return null
	}

	const courses = (accesos ?? []).flatMap((acceso) => {
		const relatedCourse = Array.isArray(acceso.cursos) ? acceso.cursos[0] : acceso.cursos
		if (!relatedCourse) return []

		const modules = Array.isArray(relatedCourse.temario)
			? relatedCourse.temario as Array<{ lessons?: unknown[] }>
			: []
		const lessonIds = modules.flatMap((module, moduleIndex) => {
			const lessons = Array.isArray(module.lessons) ? module.lessons : []
			return lessons.map((lesson, lessonIndex) => normalizeLessonId(lesson, `lesson-${moduleIndex + 1}-${lessonIndex + 1}`))
		})
		const lessonCount = lessonIds.length
		const completedLessonIds = new Set((progresoClases ?? [])
			.filter((progreso) => String(progreso.curso_id) === String(relatedCourse.id))
			.map((progreso) => String(progreso.clase_id ?? progreso.leccion_id ?? progreso.lesson_id ?? ''))
			.filter((lessonId) => lessonId.length > 0))
		const clasesCompletadas = lessonIds.filter((lessonId) => completedLessonIds.has(lessonId)).length
		const progress = lessonCount > 0 ? Math.round((clasesCompletadas / lessonCount) * 100) : 0
		const firstLessonId = getFirstLessonId(relatedCourse.temario)

		return [{
			accessId: acceso.id,
			slug: String(relatedCourse.slug ?? ''),
			category: String(relatedCourse.categoria ?? 'CURSO').toUpperCase(),
			title: String(relatedCourse.titulo ?? 'Curso'),
			image: typeof relatedCourse.imagen_url === 'string' ? relatedCourse.imagen_url : '',
			progress,
			firstLessonId,
			lessons: lessonCount > 0 ? `${clasesCompletadas} de ${lessonCount} clases` : 'Clases próximamente',
		}]
	})

	const nombreCompleto = user?.user_metadata?.nombre_completo || 'Estudiante'
	const primerNombre = nombreCompleto.trim().split(/\s+/)[0] || 'Estudiante'

	return (
		<div className="min-h-screen bg-stone-50 text-stone-800">
			<SiteHeader />

			<main className="mx-auto max-w-7xl px-5 pb-16 pt-3 sm:pt-4 lg:px-8">
				<div className="mb-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
					<div>
						<p className="mb-3 flex items-center gap-2 text-sm font-medium text-[#54745c]"><BookOpen className="size-4" /> TU ESPACIO DE APRENDIZAJE</p>
						<h1 className="max-w-3xl text-balance text-3xl font-semibold leading-tight text-stone-800 sm:text-4xl">¡Hola {primerNombre}! Qué bueno verte por acá.</h1>
						<p className="mt-3 text-stone-500">Retoma tus cursos cuando quieras. Vas avanzando a tu ritmo.</p>
					</div>
					<div className="inline-flex w-fit items-center gap-2 rounded-full border border-stone-200 bg-white px-3.5 py-2 text-sm text-stone-600">
						<LayoutGrid className="size-4 text-[#54745c]" /> {courses.length} cursos en tu biblioteca
					</div>
				</div>

				<section aria-label="Mis cursos" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
					{courses.length === 0 ? (
						<div className="col-span-full flex flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-white px-5 py-12 text-center">
							<p className="text-sm text-stone-500">Aún no tienes cursos en tu biblioteca.</p>
							<Button nativeButton={false} render={<Link href="/cursos" />} className="h-10 rounded-lg bg-[#C07A60] px-4 text-sm text-white hover:bg-[#a9634d]">Cursos <ArrowRight data-icon="inline-end" /></Button>
						</div>
					) : courses.map((course) => (
						<Card key={course.accessId ?? course.slug} className="h-full flex-col overflow-hidden rounded-2xl border-stone-200 bg-white py-0 shadow-sm transition-shadow hover:shadow-md">
							<div className="relative aspect-[16/9] overflow-hidden bg-[#ead9cc]">
								{course.image && <Image src={course.image} alt={course.title} fill priority={false} unoptimized sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition-transform duration-500 hover:scale-[1.03]" />}
								<span className="absolute left-4 top-4 z-10 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-stone-600 shadow-sm">{course.category}</span>
							</div>
							<CardContent className="flex flex-1 flex-col px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
								<h2 className="text-lg font-semibold leading-snug text-stone-800">{course.title}</h2>
								<div className="mt-4">
									<div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
										<span className="text-stone-500">{course.lessons}</span>
										<span className="font-semibold tabular-nums text-[#54745c]">{course.progress}% completado</span>
									</div>
									<Progress aria-label={`Progreso de ${course.title}`} aria-valuetext={`${course.progress}% completado`} value={course.progress}>
										<ProgressTrack />
									</Progress>
								</div>
								<Button nativeButton={false} render={<Link href={course.firstLessonId ? `/mis-cursos/${course.slug}/${course.firstLessonId}` : '/mis-cursos'} />} className="mt-4 h-10 w-full rounded-xl bg-[#C07A60] text-sm text-white hover:bg-[#a9634d]">
									Continuar aprendiendo <ArrowRight data-icon="inline-end" />
								</Button>
							</CardContent>
						</Card>
					))}
				</section>
			</main>
		</div>
	)
}
