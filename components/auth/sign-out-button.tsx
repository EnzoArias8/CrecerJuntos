'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      setIsSigningOut(false)
      return
    }

    router.replace('/')
    router.refresh()
  }

  return (
    <Button type="button" onClick={handleSignOut} disabled={isSigningOut} variant="ghost" className="h-9 rounded-full px-3 text-sm text-stone-600 hover:text-stone-900">
      <LogOut data-icon="inline-start" /> {isSigningOut ? 'Cerrando…' : 'Cerrar sesión'}
    </Button>
  )
}