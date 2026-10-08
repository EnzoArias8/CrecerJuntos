'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Heart } from 'lucide-react'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function RecoverPasswordPage() {
	const supabase = createClient()
	const [email, setEmail] = useState('')
	const [error, setError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isEmailSent, setIsEmailSent] = useState(false)

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError('')
		setIsSubmitting(true)

		const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/auth/callback?next=/actualizar-password`,
		})

		setIsSubmitting(false)
		if (resetError) {
			setError(resetError.message)
			return
		}

		setIsEmailSent(true)
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 py-10 text-stone-800">
			<div className="w-full max-w-md">
				<Button
					nativeButton={false}
					render={<Link href="/login" />}
					variant="ghost"
					className="mb-4 h-9 rounded-lg px-3 text-sm text-stone-600 hover:text-stone-900"
				>
					<ArrowLeft data-icon="inline-start" /> Volver al login
				</Button>

				<Card className="rounded-2xl border-stone-200 bg-white py-0 shadow-sm">
					<CardContent className="p-6 sm:p-8">
						<div className="mb-7 flex flex-col items-center text-center">
							<span className={`mb-4 flex size-12 items-center justify-center rounded-2xl ${isEmailSent ? 'bg-[#e7f0e7] text-[#54745c]' : 'bg-[#dce9dc] text-[#54745c]'}`}>
								{isEmailSent ? <CheckCircle2 aria-hidden="true" /> : <Heart aria-hidden="true" />}
							</span>
							<h1 className="text-2xl font-semibold tracking-tight text-stone-800">Recuperar contraseña</h1>
							<p className="mt-2 text-sm leading-6 text-stone-500">Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.</p>
						</div>

						{isEmailSent ? (
							<div role="status" className="rounded-xl bg-[#edf3eb] px-4 py-3 text-center text-sm leading-6 text-[#45624c]">
								Revisa tu bandeja de entrada para continuar
							</div>
						) : (
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<label htmlFor="email" className="text-sm font-medium text-stone-700">Correo electrónico</label>
									<Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); setError('') }} placeholder="Tu correo electrónico" className="h-11 rounded-xl border-stone-300 bg-white px-3" />
								</div>
								{error && <p role="alert" className="text-sm leading-5 text-rose-700">{error}</p>}
								<Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl bg-[#C07A60] text-sm font-semibold text-white shadow-sm hover:bg-[#a9634d]">
									{isSubmitting ? 'Enviando…' : 'Enviar enlace'}
								</Button>
							</form>
						)}
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
