'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'

type CourseReviewFormProps = {
	cursoId: string | number
	usuarioId: string
}

export function CourseReviewForm({ cursoId, usuarioId }: CourseReviewFormProps) {
	const [calificacion, setCalificacion] = useState(0)
	const [comentario, setComentario] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [isSubmitted, setIsSubmitted] = useState(false)

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError('')
		setIsSubmitting(true)

		try {
			const supabase = createClient()
			const [{ data: { user }, error: userError }, { data: curso, error: courseError }] = await Promise.all([
				supabase.auth.getUser(),
				supabase.from('cursos').select('slug').eq('id', cursoId).single(),
			])

			if (userError || !user || user.id !== usuarioId) throw new Error('Inicia sesión para enviar una opinión.')
			if (courseError || !curso) throw new Error('No se pudo encontrar el curso.')

			const nombreAutor = String(user.user_metadata?.full_name ?? user.user_metadata?.nombre_completo ?? user.email?.split('@')[0] ?? 'Estudiante')
			const { error: insertError } = await supabase.from('opiniones').insert({
				curso_slug: curso.slug,
				nombre_autor: nombreAutor,
				comentario: comentario.trim(),
				calificacion,
			})

			if (insertError) throw new Error(insertError.message)
			setIsSubmitted(true)
		} catch (submitError) {
			setError(submitError instanceof Error ? submitError.message : 'No se pudo enviar la opinión.')
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isSubmitted) {
		return <p role="status" className="rounded-xl border border-[#dce9dc] bg-[#f0f5ef] p-5 text-sm font-medium text-[#45624c]">Gracias por compartir tu opinión.</p>
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
			<div>
				<p className="text-sm font-semibold text-stone-800">Deja tu opinión</p>
				<div className="mt-2 flex items-center gap-1 text-[#d2a13b]" role="group" aria-label="Calificación">
					{Array.from({ length: 5 }, (_, index) => {
						const value = index + 1
						return (
							<button key={value} type="button" onClick={() => setCalificacion(value)} aria-label={`${value} de 5 estrellas`} aria-pressed={calificacion === value} className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54745c]">
								<Star className={`size-6 ${value <= calificacion ? 'fill-current' : 'fill-none'}`} aria-hidden="true" />
							</button>
						)
					})}
				</div>
			</div>
			<label htmlFor="review-comment" className="block text-sm font-medium text-stone-700">Tu comentario</label>
			<textarea id="review-comment" required rows={4} value={comentario} onChange={(event) => setComentario(event.target.value)} className="w-full resize-y rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-[#54745c] focus:ring-2 focus:ring-[#54745c]/20" placeholder="Cuéntanos cómo fue tu experiencia con este curso." />
			{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
			<Button type="submit" disabled={isSubmitting || calificacion === 0 || !comentario.trim()} className="h-10 rounded-lg bg-[#54745c] px-5 text-white hover:bg-[#45624c]">
				{isSubmitting ? 'Enviando...' : 'Enviar opinión'}
			</Button>
		</form>
	)
}