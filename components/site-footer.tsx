import Link from "next/link"
import { BriefcaseBusiness, Camera, Heart, Lock, PlayCircle } from "lucide-react"

export function SiteFooter({ coursePage = false }: { coursePage?: boolean }) {
  const sectionHref = (href: string) => coursePage ? `/${href}` : href

  return (
    <footer className="border-t border-stone-200 bg-stone-50 px-5 py-12 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href={sectionHref("#inicio")} className="flex items-center gap-2 font-semibold">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#dce9dc] text-[#54745c]"><Heart aria-hidden="true" /></span>
              Crecer Juntos
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-stone-500">Acompañamiento y herramientas para que cada familia encuentre su propia manera de crecer.</p>
          </div>
          <div>
            <h3 className="font-semibold">Explora</h3>
            <nav className="mt-4 flex flex-col gap-3 text-sm text-stone-500" aria-label="Enlaces del pie de página">
              <Link href="/" className="hover:text-stone-800">Inicio</Link>
              <Link href="/cursos" className="hover:text-stone-800">Nuestros Cursos</Link>
              <Link href="/preguntas-frecuentes" className="hover:text-stone-800">Preguntas Frecuentes</Link>
            </nav>
          </div>
          <div>
            <h3 className="font-semibold">Síguenos</h3>
            <div className="mt-4 flex gap-3">
              <a href="#" aria-label="Instagram" className="flex size-9 items-center justify-center rounded-full bg-white text-stone-600 hover:text-[#b56f5d]"><Camera /></a>
              <a href="#" aria-label="YouTube" className="flex size-9 items-center justify-center rounded-full bg-white text-stone-600 hover:text-[#b56f5d]"><PlayCircle /></a>
              <a href="#" aria-label="LinkedIn" className="flex size-9 items-center justify-center rounded-full bg-white text-stone-600 hover:text-[#b56f5d]"><BriefcaseBusiness /></a>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-stone-200 pt-6 text-xs text-stone-500 sm:flex-row">
          <div className="flex items-center gap-3">
            <p>© 2026 Crecer Juntos. Todos los derechos reservados.</p>
            <Link href="/admin/login" aria-label="Panel de administración" title="Panel de administración" className="text-stone-300 transition-colors hover:text-stone-500 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400">
              <Lock className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <p>Hecho con cariño para acompañar.</p>
        </div>
      </div>
    </footer>
  )
}