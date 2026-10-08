'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LandingPreloader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 3000)
    return () => window.clearTimeout(timeout)
  }, [])

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-stone-50 transition-opacity duration-700 ${isLoading ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={!isLoading}>
      <div className="flex flex-col items-center gap-4 text-[#54745c]">
        <Heart className="animate-pulse" fill="currentColor" aria-hidden="true" />
        <span className="text-lg font-semibold tracking-tight">Crecer Juntos</span>
      </div>
    </div>
  )
}

export function NewsletterForm() {
  return (
    <form className="mt-4 flex w-full max-w-lg flex-col gap-3 sm:flex-row" onSubmit={(event) => event.preventDefault()}>
      <Input type="email" required placeholder="Tu correo electrónico" aria-label="Tu correo electrónico" className="h-12 rounded-full border-stone-300 px-5" />
      <Button type="submit" className="h-12 rounded-full bg-[#54745c] px-7 text-white hover:bg-[#45624c]">Suscribirme</Button>
    </form>
  )
}