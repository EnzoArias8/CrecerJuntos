'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'

type DeleteCourseButtonProps = {
	id: string | number
}

export function DeleteCourseButton({ id }: DeleteCourseButtonProps) {
	const router = useRouter()
	const [isDeleting, setIsDeleting] = useState(false)

	async function handleDelete() {
		const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.')
		if (!confirmed) return

		setIsDeleting(true)
		const supabase = createClient()
		const { error } = await supabase.from('cursos').delete().eq('id', id)

		if (error) {
			window.alert(`No se pudo eliminar el curso: ${error.message}`)
			setIsDeleting(false)
			return
		}

		router.refresh()
	}

	return (
		<Button type="button" onClick={handleDelete} disabled={isDeleting} variant="ghost" size="icon" className="size-8 text-stone-500 transition-colors hover:bg-rose-50 hover:text-red-600" aria-label="Eliminar curso" title="Eliminar curso">
			<Trash2 />
		</Button>
	)
}