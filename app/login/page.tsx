'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart } from 'lucide-react'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
	const supabase = createClient()
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError('')
		setIsSubmitting(true)

		const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

		if (signInError) {
			setError(signInError.message)
			setIsSubmitting(false)
			return
		}

		const redirectTo = new URLSearchParams(window.location.search).get('redirectedFrom')
		const destination = redirectTo?.startsWith('/') && !redirectTo.startsWith('//')
			? redirectTo
			: '/'
		router.replace(destination)
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 py-10 text-stone-800">
			<div className="w-full max-w-md">
				<Button
					nativeButton={false}
					render={<Link href="/" />}
					variant="ghost"
					className="mb-4 h-9 rounded-lg px-3 text-sm text-stone-600 hover:text-stone-900"
				>
					<ArrowLeft data-icon="inline-start" /> Volver al inicio
				</Button>

				<Card className="rounded-2xl border-stone-200 bg-white py-0 shadow-sm">
					<CardContent className="p-6 sm:p-8">
						<div className="mb-7 flex flex-col items-center text-center">
							<span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#dce9dc] text-[#54745c]">
								<Heart aria-hidden="true" />
							</span>
							<h1 className="text-2xl font-semibold tracking-tight text-stone-800">¡Qué bueno verte de nuevo!</h1>
							<p className="mt-2 text-sm leading-6 text-stone-500">Ingresa para continuar aprendiendo junto a nosotras.</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="email" className="text-sm font-medium text-stone-700">Tu correo electrónico</label>
								<Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Tu correo electrónico" className="h-11 rounded-xl border-stone-300 bg-white px-3" />
							</div>
							<div className="space-y-2">
								<label htmlFor="password" className="text-sm font-medium text-stone-700">Tu contraseña</label>
								<Input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tu contraseña" className="h-11 rounded-xl border-stone-300 bg-white px-3" />
							</div>
							{error && <p role="alert" className="text-sm leading-5 text-rose-700">{error}</p>}
							<Link href="/recuperar-password" className="block w-fit text-sm text-stone-500 underline-offset-4 transition-colors hover:text-[#54745c] hover:underline">¿Olvidaste tu contraseña?</Link>
							<Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl bg-[#C07A60] text-sm font-semibold text-white shadow-sm hover:bg-[#a9634d]">{isSubmitting ? 'Ingresando…' : 'Ingresar'}</Button>
						</form>

						<p className="mt-6 text-center text-sm text-stone-500">
							¿Aún no tienes cuenta?{' '}
							<Link href="/registro" className="font-medium text-[#54745c] underline-offset-4 hover:underline">Regístrate</Link>
						</p>
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
