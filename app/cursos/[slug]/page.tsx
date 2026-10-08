import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { LockKeyhole, ShieldCheck, Star, Wallet } from "lucide-react"

import { CoursePurchaseButton } from "@/components/course-purchase-button"
import { PayPalCourseButton } from "@/components/paypal-course-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"

type CourseModule = {
	id?: string
	title?: string
	lessons?: Array<string | { id?: string; title?: string }>
}

function formatPrice(value: number | string | null | undefined, currency = "ARS") {
	if (value == null || value === "") return "Consultar"
	return new Intl.NumberFormat("es-AR", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value))
}

function splitLines(value: string | null | undefined) {
	return (value ?? "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
	const resolvedParams = await params
	const supabase = await createClient()
	const { data: curso } = await supabase
		.from("cursos")
		.select("*")
		.eq("slug", resolvedParams.slug)
		.single()

	if (!curso) notFound()

	const { data: opiniones } = await supabase
		.from("opiniones")
		.select("calificacion")
		.eq("curso_slug", resolvedParams.slug)
	const calificaciones = (opiniones ?? []).filter((opinion) => opinion.calificacion != null).map((opinion) => Number(opinion.calificacion)).filter(Number.isFinite)
	const totalOpiniones = opiniones?.length ?? 0
	const promedioCalificacion = calificaciones.length > 0
		? calificaciones.reduce((total, calificacion) => total + calificacion, 0) / calificaciones.length
		: 5

	const courseSlug = String(curso.slug ?? resolvedParams.slug)
	const courseTitle = String(curso.titulo ?? "")
	const courseCategory = String(curso.categoria ?? "")
	const courseDescription = [curso.descripcion_corta, curso.descripcion_completa].filter(Boolean).join(" ")
	const imageUrl = String(curso.imagen_url ?? "")
	const formattedPrice = formatPrice(curso.precio_ars)
	const priceUsd = curso.precio_usd == null ? null : `${formatPrice(curso.precio_usd, "USD")} USD`
	const rawUsdAmount = Number(curso.precio_usd)
	const paypalAmount = Number.isFinite(rawUsdAmount) && rawUsdAmount > 0 ? rawUsdAmount.toFixed(2) : "10.00"
	const audience = String(curso.dirigido_a ?? "")
	const modality = String(curso.modalidad ?? "Online y a tu ritmo.")
	const courseTopics = splitLines(curso.que_aprenderan).length > 0
		? splitLines(curso.que_aprenderan)
		: splitLines(curso.temas_principales)
	const rawModules = Array.isArray(curso.temario) ? curso.temario as CourseModule[] : []
	const lessons = rawModules.flatMap((module, moduleIndex) =>
		(Array.isArray(module.lessons) ? module.lessons : []).map((lesson, lessonIndex) => ({
			id: typeof lesson === "string" ? `${moduleIndex}-${lessonIndex}` : lesson.id ?? `${moduleIndex}-${lessonIndex}`,
			title: typeof lesson === "string" ? lesson : lesson.title ?? "",
		})).filter((lesson) => lesson.title)
	)
	return (
		<div className="min-h-screen bg-stone-50 text-stone-800">
			<main className="mx-auto max-w-7xl px-5 pt-3 pb-8 sm:pt-4 sm:pb-12 lg:px-8 lg:pt-4 lg:pb-14">
				<nav aria-label="Ruta de navegación" className="mb-7 text-sm text-stone-500">
					<Link href="/cursos" className="transition-colors hover:text-[#9f5e4d]">Cursos</Link>
					<span className="mx-2 text-stone-300" aria-hidden="true">/</span>
					<span className="text-stone-700">{courseTitle}</span>
				</nav>

				<div className="grid items-start gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:gap-12">
					<div className="min-w-0 space-y-10 sm:space-y-12">
						<section aria-labelledby="course-title">
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#54745c]">{courseCategory ? `Curso online · ${courseCategory}` : "Curso online para familias"}</p>
							<h1 id="course-title" className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-tight text-stone-800 sm:text-5xl">{courseTitle}</h1>
							<p className="mt-4 max-w-2xl whitespace-pre-wrap text-lg leading-8 text-stone-600">{courseDescription}</p>
							<div className="mt-5 flex flex-wrap items-center gap-3">
								<div className="flex items-center gap-0.5 text-[#d2a13b]" aria-label={`${promedioCalificacion.toFixed(1)} de 5 estrellas`}>
									{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`size-4 ${index < Math.round(promedioCalificacion) ? "fill-current" : "fill-none"}`} aria-hidden="true" />)}
								</div>
								<Link href="#opiniones" className="text-sm text-stone-500 underline decoration-stone-300 underline-offset-4 hover:text-stone-800">Ver opiniones ({totalOpiniones} opiniones)</Link>
							</div>
						</section>

						<section aria-labelledby="purchase-options" className="space-y-4">
							<div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9f5e4d]">Inscripción</p><h2 id="purchase-options" className="mt-2 text-2xl font-semibold text-stone-800">Elegí cómo comprarlo</h2></div>
							<div className="grid gap-3 sm:grid-cols-2">
								<Card className="rounded-xl border-[#dfc5b8] bg-white py-0 shadow-sm ring-1 ring-[#f1e5de]"><CardContent className="p-5"><p className="text-sm font-medium text-stone-600">Pagando con Mercado Pago</p><p className="mt-3 text-3xl font-semibold tracking-tight text-stone-800">{formattedPrice}</p><p className="mt-1 text-xs text-stone-500">Pago único en pesos</p><CoursePurchaseButton courseId={courseSlug} className="mt-5 h-10 w-full rounded-lg px-4 bg-[#FFE600] hover:bg-[#FFD100] text-[#001b33] font-bold flex justify-center items-center gap-2 transition-all"><Wallet aria-hidden="true" /> Pagar con Mercado Pago</CoursePurchaseButton></CardContent></Card>
								<Card className="rounded-xl border-stone-200 bg-white py-0 shadow-sm"><CardContent className="p-5"><p className="text-sm font-medium text-stone-600">Pagando con PayPal</p><p className="mt-3 text-3xl font-semibold tracking-tight text-stone-800">{priceUsd ?? "No disponible"}</p><p className="mt-1 text-xs text-stone-500">Pago único en dólares</p><div className="mt-4 relative z-0"><PayPalCourseButton courseTitle={courseTitle} amount={paypalAmount} /></div></CardContent></Card>
							</div>
						</section>

						<section aria-labelledby="syllabus-title">
							<div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#54745c]">Contenido incluido</p><h2 id="syllabus-title" className="mt-2 text-2xl font-semibold text-stone-800">Temario del curso</h2></div><span className="text-sm text-stone-500">{lessons.length} {lessons.length === 1 ? "clase" : "clases"}</span></div>
							<Card className="rounded-xl border-stone-200 bg-white py-0 shadow-sm"><CardContent className="divide-y divide-stone-100 p-0">
								{rawModules.map((modulo, moduleIndex) => (
									<div key={modulo.id ?? `${moduleIndex}-${modulo.title}`}>
										{modulo.title && <h4 className="font-semibold text-lg text-gray-800 px-5 pt-5 pb-2">{modulo.title}</h4>}
										{(Array.isArray(modulo.lessons) ? modulo.lessons : []).map((lesson, lessonIndex) => {
											const lessonTitle = typeof lesson === "string" ? lesson : lesson.title ?? ""
											const lessonId = typeof lesson === "string" ? `${moduleIndex}-${lessonIndex}` : lesson.id ?? `${moduleIndex}-${lessonIndex}`
											return <div key={lessonId} className="flex items-center gap-3 px-4 py-4 sm:px-5"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#fbf1ed] text-[#ba7660]"><LockKeyhole className="size-4" aria-hidden="true" /></span><span className="min-w-0 flex-1 text-sm font-medium leading-5 text-stone-700">{moduleIndex + 1}.{lessonIndex + 1}. {lessonTitle}</span><span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">Bloqueada</span></div>
										})}
									</div>
								))}
							</CardContent></Card>
						</section>

						<section aria-label="Detalles del curso" className="grid gap-6 border-t border-stone-200 pt-8 md:grid-cols-3">
							<div><h2 className="text-base font-semibold text-stone-800">¿A quién está dirigido?</h2><ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">{audience.split('-').filter((item) => item.trim() !== '').map((item, index) => <li key={index}>{item.trim()}</li>)}</ul></div>
							<div><h2 className="text-base font-semibold text-stone-800">¿Qué aprenderán?</h2><ol className="mt-3 list-decimal space-y-2 pl-4 text-sm leading-6 text-stone-600">{courseTopics.slice(0, 4).map((topic, index) => <li key={`${index}-${topic}`}>{topic}</li>)}</ol></div>
							<div><h2 className="text-base font-semibold text-stone-800">Modalidad</h2><ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">{modality.split('-').filter((item) => item.trim() !== '').map((item, index) => <li key={index}>{item.trim()}</li>)}</ul></div>
						</section>

						<section aria-labelledby="teachers-title" className="border-t border-stone-200 pt-8">
							<p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9f5e4d]">Acompañamiento profesional</p><h2 id="teachers-title" className="mt-2 text-2xl font-semibold text-stone-800">¿Quién lo dicta?</h2>
							<div className="mt-5 grid gap-4 sm:grid-cols-2">
								<Card className="rounded-xl border-[#dce9dc] bg-[#f0f5ef] py-0 shadow-none flex flex-row items-center gap-5"><CardContent className="p-5 flex flex-row items-center gap-5"><span className="flex w-24 h-24 shrink-0 items-center justify-center rounded-full bg-white text-[#54745c]"><img src="/rocio.jpg" alt="Rocío Arias" className="w-full h-full object-cover rounded-full" /></span><div className="flex flex-col"><h3 className="text-lg font-semibold text-stone-800">Rocío Arias</h3><p className="text-sm text-gray-500 mt-1">Lic. en Psicopedagogía</p></div></CardContent></Card>
								<Card className="rounded-xl border-[#f0ddd4] bg-[#fbf1ed] py-0 shadow-none flex flex-row items-center gap-5"><CardContent className="p-5 flex flex-row items-center gap-5"><span className="flex w-24 h-24 shrink-0 items-center justify-center rounded-full bg-white text-[#b56f5d]"><img src="/lucia.jpg" alt="Lucía Sanmartino" className="w-full h-full object-cover rounded-full" /></span><div className="flex flex-col"><h3 className="text-lg font-semibold text-stone-800">Lucía Sanmartino</h3><p className="text-sm text-gray-500 mt-1">Lic. en Psicopedagogía</p></div></CardContent></Card>
							</div>
						</section>
					</div>

					<aside className="self-start lg:sticky lg:top-6" aria-label="Inscripción al curso">
						<Card className="overflow-hidden rounded-2xl border-stone-200 bg-white py-0 shadow-md shadow-stone-900/5">
							<div className="relative aspect-[4/3] overflow-hidden bg-[#ead9cc]">
								{imageUrl && <Image src={imageUrl} alt={courseTitle} fill priority unoptimized sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />}
							</div>
							<CardContent className="space-y-5 p-5 sm:p-6">
								<div className="border-t border-stone-100 pt-4"><p className="text-xs font-medium uppercase tracking-wide text-stone-400">Inversión desde</p><p className="mt-1 text-3xl font-semibold tracking-tight text-stone-800">{formattedPrice}</p><p className="mt-1 text-sm text-stone-500">o {priceUsd ?? "USD no disponible"}</p></div>
								<CoursePurchaseButton courseId={courseSlug} className="h-12 w-full rounded-xl bg-[#C07A60] px-5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#a9634d]">Quiero aprender</CoursePurchaseButton>
								<p className="flex items-center justify-center gap-2 text-xs text-stone-400"><ShieldCheck className="size-4 text-stone-400" /> Pago seguro y protegido</p>
							</CardContent>
						</Card>
					</aside>
				</div>
			</main>
		</div>
	)
}
