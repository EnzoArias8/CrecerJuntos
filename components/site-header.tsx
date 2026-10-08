import Link from 'next/link'
import { Heart, Menu } from 'lucide-react'

import { SignOutButton } from '@/components/auth/sign-out-button'
import { SiteNavigation } from '@/components/site-navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { createClient } from '@/utils/supabase/server'

const publicNavigation = [
  ['Inicio', '/'],
  ['Cursos', '/cursos'],
  ['Preguntas Frecuentes', '/preguntas-frecuentes'],
] as const

function getInitials(name: string) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
  return initials || 'U'
}

export async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const displayName = typeof user?.user_metadata?.nombre_completo === 'string'
    ? user.user_metadata.nombre_completo
    : user?.email?.split('@')[0] ?? 'Usuario'
  const initials = getInitials(displayName)
  const navigation = user ? [...publicNavigation.slice(0, 2), ['Mis Cursos', '/mis-cursos'] as const, publicNavigation[2]] : publicNavigation

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-stone-800" aria-label="Inicio de Crecer Juntos">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#dce9dc] text-[#54745c]"><Heart aria-hidden="true" /></span>
          <span className="text-lg">Crecer Juntos</span>
        </Link>
        <SiteNavigation navigation={navigation} className="hidden items-center gap-8 text-sm md:flex" />
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden items-center gap-2 sm:flex">
                <Avatar aria-label={`Perfil de ${displayName}`} className="size-9 ring-1 ring-stone-200"><AvatarFallback className="bg-[#e7f0e7] text-xs text-[#45624c]">{initials}</AvatarFallback></Avatar>
                <SignOutButton />
              </div>
              <Avatar aria-label={`Perfil de ${displayName}`} className="size-9 ring-1 ring-stone-200 sm:hidden"><AvatarFallback className="bg-[#e7f0e7] text-xs text-[#45624c]">{initials}</AvatarFallback></Avatar>
            </>
          ) : (
            <>
              <div className="hidden items-center gap-2 sm:flex">
                <Link href="/login" className={buttonVariants({ variant: 'outline', className: 'rounded-full border-stone-300 bg-transparent' })}>Ingresar</Link>
                <Link href="/registro" className={buttonVariants({ className: 'rounded-full bg-[#C07A60] px-4 text-white hover:bg-[#a9634d]' })}>Registrarse</Link>
              </div>
              <Sheet>
                <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú" />}><Menu /></SheetTrigger>
                <SheetContent className="bg-stone-50">
                  <SheetTitle className="text-left text-xl text-stone-800">Menú</SheetTitle>
                  <SiteNavigation navigation={navigation} className="mt-8 flex flex-col gap-5 text-lg" ariaLabel="Menú móvil" />
                  <div className="mt-8 flex flex-col gap-3">
                    <Link href="/login" className={buttonVariants({ variant: 'outline', className: 'h-10 w-full rounded-full border-stone-300 bg-transparent' })}>Ingresar</Link>
                    <Link href="/registro" className={buttonVariants({ className: 'h-10 w-full rounded-full bg-[#C07A60] text-white hover:bg-[#a9634d]' })}>Registrarse</Link>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
          {user && <div className="md:hidden"><Sheet><SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú" />}><Menu /></SheetTrigger><SheetContent className="bg-stone-50"><SheetTitle className="text-left text-xl text-stone-800">Menú</SheetTitle><SiteNavigation navigation={navigation} className="mt-8 flex flex-col gap-5 text-lg" ariaLabel="Menú móvil" /><div className="mt-8 flex items-center gap-3 border-t border-stone-200 pt-5"><Avatar className="size-9"><AvatarFallback className="bg-[#e7f0e7] text-xs text-[#45624c]">{initials}</AvatarFallback></Avatar><span className="min-w-0 flex-1 truncate text-sm text-stone-600">{displayName}</span><SignOutButton /></div></SheetContent></Sheet></div>}
        </div>
      </div>
    </header>
  )
}