'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type SiteNavigationProps = {
	navigation: readonly (readonly [string, string])[]
	className: string
	ariaLabel?: string
}

export function SiteNavigation({ navigation, className, ariaLabel = 'Navegación principal' }: SiteNavigationProps) {
	const pathname = usePathname()

	return (
		<nav className={className} aria-label={ariaLabel}>
			{navigation.map(([label, href]) => {
				const isActive = href === '/'
					? pathname === '/'
					: pathname === href || pathname.startsWith(`${href}/`)
				return <Link key={label} href={href} aria-current={isActive ? 'page' : undefined} className={`transition-colors ${isActive ? 'font-semibold text-[#54745c]' : 'text-stone-600 hover:text-[#54745c]'}`}>{label}</Link>
			})}
		</nav>
	)
}