'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, ChevronRight, CircleDollarSign, GraduationCap, LayoutDashboard, Menu, ShieldCheck, Users, UserRoundPlus, X } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const navigation = [
	{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
	{ label: 'Cursos', href: '/admin/cursos', icon: BookOpen },
	{ label: 'Registros', href: '/admin/familias', icon: Users },
	{ label: 'Ventas', href: '/admin/ventas', icon: CircleDollarSign },
] as const

const sectionTitles: Record<string, string> = {
	'/admin': 'Dashboard',
	'/admin/cursos': 'Cursos',
	'/admin/familias': 'Registros',
	'/admin/ventas': 'Ventas',
}
function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
	return (
		<>
			<Link href="/admin" onClick={onNavigate} className="flex h-[76px] shrink-0 items-center gap-3 border-b border-stone-200 px-5" aria-label="Crecer Juntos, inicio de administración">
				<span className="flex size-9 items-center justify-center rounded-xl bg-[#dce9dc] text-[#45624c]"><BookOpen className="size-5" /></span>
				<span className="min-w-0"><span className="block text-sm font-semibold text-stone-800">Crecer Juntos</span><span className="mt-0.5 block text-[10px] uppercase tracking-[0.14em] text-stone-500">Administración</span></span>
			</Link>
			<nav className="flex-1 space-y-1 px-3 py-6" aria-label="Navegación de administración">
				<p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Espacio de trabajo</p>
				{navigation.map(({ label, href, icon: Icon }) => {
					const isActive = href === '/admin'
						? pathname === href
						: pathname === href || pathname.startsWith(`${href}/`)
					return <Link key={label} href={href} onClick={onNavigate} aria-current={isActive ? 'page' : undefined} className={`group flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${isActive ? 'bg-white font-medium text-stone-800 shadow-sm' : 'text-stone-600 hover:bg-white/70 hover:text-stone-900'}`}><Icon className={`size-[17px] ${isActive ? 'text-[#54745c]' : 'text-stone-500 group-hover:text-stone-700'}`} />{label}</Link>
				})}
			</nav>
		</>
	)
}

export default function AdminLayout({ children }: { children: ReactNode }) {
	const pathname = usePathname()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	if (pathname === '/admin/login') return children
	const title = sectionTitles[pathname] ?? (pathname.startsWith('/admin/cursos/') ? 'Cursos' : 'Administración')

	return (
		<div className="min-h-screen bg-stone-50 text-stone-800 lg:flex">
				<aside className="fixed inset-y-0 left-0 hidden w-64 shrink-0 flex-col bg-[#f2eee8] lg:flex" aria-label="Menú de administración"><SidebarContent pathname={pathname} /></aside>
				<div className="min-w-0 flex-1 lg:pl-64">
					<header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
						<div className="flex min-w-0 items-center gap-3">
							<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
								<SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú de administración" />}><Menu /></SheetTrigger>
								<SheetContent side="left" className="w-72 border-0 bg-[#f2eee8] p-0 text-stone-800" showCloseButton={false}>
									<div className="flex h-full flex-col"><div className="flex justify-end p-3"><SheetClose render={<Button variant="ghost" size="icon" aria-label="Cerrar menú" className="text-stone-600 hover:bg-white/70 hover:text-stone-900" />}><X /></SheetClose></div><SidebarContent pathname={pathname} onNavigate={() => setIsMobileMenuOpen(false)} /></div>
									<SheetTitle className="sr-only">Menú de administración</SheetTitle>
								</SheetContent>
							</Sheet>
							<div className="hidden text-sm text-stone-400 sm:flex sm:items-center sm:gap-2"><span>Administración</span><ChevronRight className="size-3.5" /></div><span className="truncate text-sm font-semibold text-stone-800 sm:border-l sm:border-stone-200 sm:pl-3">{title}</span>
						</div>
						<div className="flex items-center gap-2 sm:gap-3">
							<Link href="/" className={buttonVariants({ variant: 'outline', className: 'h-9 rounded-lg border-stone-200 px-3 text-sm text-stone-600' })}>Volver al inicio</Link>
							<Button variant="ghost" size="icon" className="relative text-stone-600" aria-label="Notificaciones"><span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#c47a60] ring-2 ring-white" /><ShieldCheck /></Button><Avatar className="size-9 lg:hidden"><AvatarFallback className="bg-[#e5d8cb] text-xs text-[#6b5545]">LC</AvatarFallback></Avatar>
						</div>
					</header>
					<main className="mx-auto max-w-[1440px] px-4 pb-12 pt-7 sm:px-6 sm:pt-9 lg:px-8">{children}</main>
				</div>
			</div>
	)
}