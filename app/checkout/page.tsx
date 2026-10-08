'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Heart, LockKeyhole, ShieldCheck } from 'lucide-react'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type CheckoutCourse = {
	id: string
	titulo: string
	precio_ars: number
	imagen_url: string | null
	categoria: string | null
}

function formatPrice(value: number) {
	return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)
}

function CheckoutContent() {
	const supabase = createClient()
	const router = useRouter()
	const searchParams = useSearchParams()
	const cursoId = searchParams.get('id')
	const [curso, setCurso] = useState<CheckoutCourse | null>(null)
	const [isLoadingCourse, setIsLoadingCourse] = useState(true)
	const [email, setEmail] = useState('')
	const [isCheckingUser, setIsCheckingUser] = useState(true)
	const [isProcessing, setIsProcessing] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		let isMounted = true

		async function loadCourse() {
			setCurso(null)
			setIsLoadingCourse(true)

			if (!cursoId) {
				setError('No se especificó un curso para comprar.')
				setIsLoadingCourse(false)
				return
			}

			const { data, error: courseError } = await supabase
				.from('cursos')
				.select('*')
				.eq('slug', cursoId)
				.single()

			if (!isMounted) return
			if (courseError || !data) {
				setError('No pudimos cargar los datos del curso.')
				setIsLoadingCourse(false)
				return
			}

			const courseData = data as Record<string, unknown>
			setCurso({
				id: String(courseData.id),
				titulo: String(courseData.titulo ?? ''),
				precio_ars: Number(courseData.precio_ars),
				imagen_url: String(courseData.imagen_url ?? courseData.imagen ?? courseData.image_url ?? '') || null,
				categoria: String(courseData.categoria ?? courseData.category ?? '') || null,
			})
			setError('')
			setIsLoadingCourse(false)
		}

		void loadCourse()
		return () => { isMounted = false }
	}, [cursoId, supabase])

	useEffect(() => {
		let isMounted = true

		async function loadCurrentUser() {
			const { data: { user }, error: userError } = await supabase.auth.getUser()
			if (!isMounted) return

			if (userError || !user?.email) {
				router.replace('/login')
				return
			}

			setEmail(user.email)
			setIsCheckingUser(false)
		}

		void loadCurrentUser()
		return () => { isMounted = false }
	}, [router, supabase])

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError('')
		setIsProcessing(true)

		try {
			const { data: { user }, error: userError } = await supabase.auth.getUser()
			if (userError || !user?.email) {
				router.push('/login')
				return
			}

			const response = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ titulo: curso?.titulo, precio: curso?.precio_ars, cursoId: curso?.id, email: user.email }),
			})

			if (!response.ok) throw new Error('Error al crear la preferencia de pago. Inténtalo nuevamente.')

			const data: { init_point?: string } = await response.json()
			if (!data.init_point) throw new Error('La pasarela no devolvió un enlace de pago válido.')

			window.location.href = data.init_point
		} catch (paymentError) {
			setError(paymentError instanceof Error ? paymentError.message : 'Ocurrió un error al procesar el pago.')
		} finally {
			setIsProcessing(false)
		}
	}
	const precioFormateado = curso && Number.isFinite(curso.precio_ars) ? formatPrice(curso.precio_ars) : '—'

	return (
		<div className="min-h-screen bg-stone-50 text-stone-800">
			<header className="border-b border-stone-200 bg-white">
				<div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:h-[72px]">
					<Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="Volver al inicio de Crecer Juntos">
						<span className="flex size-9 items-center justify-center rounded-xl bg-[#dce9dc] text-[#54745c]"><Heart aria-hidden="true" /></span>
						<span>Crecer Juntos</span>
					</Link>
					<span className="flex items-center gap-2 text-sm font-medium text-stone-600"><LockKeyhole className="size-4 text-[#54745c]" /> Pago seguro</span>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-5 pb-16 pt-7 sm:pt-10">
				<Link href={cursoId ? `/cursos/${cursoId}` : '/cursos'} className="mb-6 inline-flex items-center gap-2 text-sm text-stone-500 transition-colors hover:text-stone-800">
					<ArrowLeft className="size-4" /> Volver al curso
				</Link>

				<div className="mb-8">
					<p className="text-sm font-medium text-[#9f5e4d]">Estás a un paso de empezar</p>
					<h1 className="mt-1 text-3xl font-semibold text-stone-800">Finaliza tu compra</h1>
				</div>

				<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:gap-8">
					<Card className="rounded-2xl border-stone-200 bg-white py-0 shadow-sm">
						<CardContent className="p-5 sm:p-8">
							<form onSubmit={handleSubmit} className="space-y-8">
								<section aria-labelledby="details-title">
									<div className="mb-5">
										<h2 id="details-title" className="text-xl font-semibold">Tus Datos</h2>
										<p className="mt-1 text-sm text-stone-500">Confirma tus datos antes de continuar al pago.</p>
									</div>
									<div className="grid gap-4 sm:grid-cols-2">
										<div className="space-y-2">
											<label htmlFor="first-name" className="text-sm font-medium text-stone-700">Nombre</label>
											<Input id="first-name" name="firstName" autoComplete="given-name" required placeholder="Tu nombre" className="h-11 rounded-xl border-stone-300 bg-white px-3" />
										</div>
										<div className="space-y-2">
											<label htmlFor="last-name" className="text-sm font-medium text-stone-700">Apellido</label>
											<Input id="last-name" name="lastName" autoComplete="family-name" required placeholder="Tu apellido" className="h-11 rounded-xl border-stone-300 bg-white px-3" />
										</div>
										<div className="space-y-2 sm:col-span-2">
											<label htmlFor="email" className="text-sm font-medium text-stone-700">Email</label>
											<Input id="email" name="email" type="email" autoComplete="email" readOnly required value={email} placeholder="Cargando correo de tu cuenta…" className="h-11 rounded-xl border-stone-300 bg-stone-50 px-3 read-only:text-stone-600" />
										</div>
									</div>
								</section>

								<section aria-labelledby="payment-title" className="border-t border-stone-200 pt-7">
									<div className="mb-5">
											<h2 id="payment-title" className="text-lg font-semibold">Pago seguro</h2>
											<p className="mt-1 text-sm text-stone-500">Continuarás a Mercado Pago para completar tu compra.</p>
									</div>
								</section>

								<div className="space-y-4 border-t border-stone-200 pt-6">
										<Button type="submit" disabled={isProcessing || isCheckingUser || isLoadingCourse || !curso || !email} className="h-12 w-full rounded-xl bg-[#C07A60] text-base font-semibold text-white shadow-sm hover:bg-[#a9634d]">
											<LockKeyhole data-icon="inline-start" /> {isProcessing ? 'Procesando...' : curso ? `Pagar ${precioFormateado} de forma segura` : 'Cargando curso...'}
									</Button>
									<p className="flex items-center justify-center gap-2 text-xs text-stone-500"><ShieldCheck className="size-4 text-[#54745c]" /> Tus datos están protegidos y cifrados.</p>
										{error && <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm leading-5 text-rose-700">{error}</p>}
								</div>
							</form>
						</CardContent>
					</Card>

					<Card className="rounded-2xl border-stone-200 bg-white py-0 shadow-sm lg:sticky lg:top-6">
						<CardContent className="p-5 sm:p-6">
							<h2 className="text-lg font-semibold">Resumen de compra</h2>
							<div className="mt-5 flex items-center gap-4 rounded-xl bg-stone-100 p-3">
								<div className="relative size-[76px] shrink-0 overflow-hidden rounded-lg bg-[#ead9cc]">
									{curso?.imagen_url && <Image src={curso.imagen_url} alt={curso.titulo} fill sizes="76px" unoptimized className="object-cover" />}
								</div>
								<div className="min-w-0">
									<p className="text-xs font-medium text-[#9f5e4d]">{curso?.categoria?.toUpperCase() || 'CURSO'}</p>
									<h3 className="mt-1 font-semibold leading-5 text-stone-800">{curso?.titulo || 'Cargando curso...'}</h3>
									<p className="mt-1 text-xs text-stone-500">Curso online · Acceso ilimitado</p>
								</div>
							</div>
							<dl className="mt-6 space-y-3 text-sm">
								<div className="flex justify-between gap-4 text-stone-600"><dt>Subtotal</dt><dd>{precioFormateado}</dd></div>
								<div className="flex justify-between gap-4 text-stone-600"><dt>Descuentos</dt><dd>$0</dd></div>
								<div className="flex justify-between gap-4 border-t border-stone-200 pt-4 text-base font-semibold text-stone-800"><dt>Total</dt><dd>{precioFormateado}</dd></div>
							</dl>
							<div className="mt-6 flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-3.5">
								<LockKeyhole className="mt-0.5 size-4 shrink-0 text-[#54745c]" aria-hidden="true" />
								<p className="text-xs leading-5 text-stone-500">Compra protegida. Tu acceso al curso estará disponible después de completar el pago.</p>
							</div>
						</CardContent>
					</Card>
				</div>
				<p className="mt-7 text-center text-xs text-stone-400">Al continuar, aceptas los términos y condiciones de Crecer Juntos.</p>
			</main>
		</div>
	)
}

export default function CheckoutPage() {
	return (
		<Suspense fallback={<p>Cargando checkout...</p>}>
			<CheckoutContent />
		</Suspense>
	)
}
