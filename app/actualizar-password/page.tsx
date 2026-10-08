'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound } from 'lucide-react'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function UpdatePasswordPage() {
	const supabase = createClient()
	const router = useRouter()
	const [newPassword, setNewPassword] = useState('')
	const [error, setError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError('')
		setIsSubmitting(true)

		const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

		if (updateError) {
			setError(updateError.message)
			setIsSubmitting(false)
			return
		}

		router.push('/mis-cursos')
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 py-10 text-stone-800">
			<div className="w-full max-w-md">
				<Card className="rounded-2xl border-stone-200 bg-white py-0 shadow-sm">
					<CardContent className="p-6 sm:p-8">
						<div className="mb-7 flex flex-col items-center text-center">
							<span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#dce9dc] text-[#54745c]">
								<KeyRound aria-hidden="true" />
							</span>
							<h1 className="text-2xl font-semibold tracking-tight text-stone-800">Crear nueva contraseña</h1>
							<p className="mt-2 text-sm leading-6 text-stone-500">Escribe tu nueva clave de acceso.</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="new-password" className="text-sm font-medium text-stone-700">Nueva contraseña</label>
								<Input id="new-password" name="password" type="password" autoComplete="new-password" required value={newPassword} onChange={(event) => { setNewPassword(event.target.value); setError('') }} placeholder="Escribe tu nueva contraseña" className="h-11 rounded-xl border-stone-300 bg-white px-3" />
							</div>
							{error && <p role="alert" className="text-sm leading-5 text-rose-700">{error}</p>}
							<Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl bg-[#C07A60] text-sm font-semibold text-white shadow-sm hover:bg-[#a9634d]">
								{isSubmitting ? 'Guardando…' : 'Guardar contraseña'}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
