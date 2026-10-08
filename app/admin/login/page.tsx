'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'

export default function AdminLoginPage() {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError('')
		setIsSubmitting(true)

		try {
			const supabase = createClient()
			const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

			if (signInError) {
				setError('Credenciales incorrectas')
				return
			}

			router.push('/admin')
			router.refresh()
		} catch {
			setError('Credenciales incorrectas')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 py-10 text-stone-800">
			<section className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
				<div className="mb-6 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">Acceso de administración</h1>
					
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="admin-email" className="text-sm font-medium text-stone-700">Correo electrónico</label>
						<Input id="admin-email" name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 rounded-lg border-stone-300 bg-white px-3" />
					</div>
					<div className="space-y-2">
						<label htmlFor="admin-password" className="text-sm font-medium text-stone-700">Contraseña</label>
						<Input id="admin-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 rounded-lg border-stone-300 bg-white px-3" />
					</div>
					{error && <p role="alert" className="text-sm text-red-600">{error}</p>}
					<Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-lg bg-[#54745c] text-white hover:bg-[#45624c]">
						{isSubmitting ? 'Ingresando…' : 'Ingresar al panel'}
					</Button>
				</form>
			</section>
		</main>
	)
}
