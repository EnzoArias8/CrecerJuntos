'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'

type CoursePurchaseButtonProps = {
	courseId: string
	children: React.ReactNode
	className?: string
	variant?: 'default' | 'outline'
}

export function CoursePurchaseButton({ courseId, children, className, variant = 'default' }: CoursePurchaseButtonProps) {
	const router = useRouter()
	const [isCheckingSession, setIsCheckingSession] = useState(false)

	async function handlePurchase() {
		setIsCheckingSession(true)
		const supabase = createClient()
		const { data: { session } } = await supabase.auth.getSession()

		if (!session) {
			router.push('/login')
			return
		}

		router.push(`/checkout?id=${courseId}`)
	}

	return (
		<Button type="button" onClick={handlePurchase} disabled={isCheckingSession} variant={variant} className={className}>
			{isCheckingSession ? 'Verificando…' : children}
		</Button>
	)
}