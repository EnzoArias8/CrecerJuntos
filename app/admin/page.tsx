import Link from 'next/link'
import { BookOpen, ChevronRight, CircleDollarSign, GraduationCap, ShieldCheck, UserRoundPlus } from 'lucide-react'
import { createClient as createSupabaseAdmin, type User } from '@supabase/supabase-js'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

const metricStyles = [
  { label: 'Total de Ventas', icon: CircleDollarSign, color: 'bg-[#e7f0e7] text-[#54745c]' },
  { label: 'Cursos Vendidos', icon: GraduationCap, color: 'bg-[#e8f0f1] text-[#4d777c]' },
  { label: 'Cursos Publicados', icon: BookOpen, color: 'bg-[#f7ece7] text-[#a96952]' },
  { label: 'Nuevos Registros', icon: UserRoundPlus, color: 'bg-[#f3eee3] text-[#927344]' },
]

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const fechaActual = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  const fechaCapitalizada = fechaActual.charAt(0).toUpperCase() + fechaActual.slice(1)

  const [
    { count: cursosCount },
    { data: accesos, count: cursosVendidosCount },
  ] = await Promise.all([
    supabase.from('cursos').select('*', { count: 'exact', head: true }),
    supabase.from('accesos').select('monto_abonado', { count: 'exact' }).eq('estado', 'activo'),
  ])

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  let authUsers: User[] = []
  let authUsersError = false

  if (!supabaseUrl || !serviceRoleKey) {
    authUsersError = true
  } else {
    const supabaseAdmin = createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const pageSize = 1000
    let page = 1
    let hasMoreUsers = true

    while (hasMoreUsers) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: pageSize })
      if (error) {
        authUsers = []
        authUsersError = true
        break
      }

      authUsers.push(...data.users)
      hasMoreUsers = data.users.length === pageSize
      page += 1
    }
  }

  const recentUsers = authUsers
    .sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime())
    .slice(0, 5)
  const totalVentas = (accesos ?? []).reduce((total, acceso) => total + Number(acceso.monto_abonado ?? 0), 0)
  const ventasFormateadas = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(totalVentas)
  const metrics = [
    { ...metricStyles[0], value: ventasFormateadas },
    { ...metricStyles[1], value: (cursosVendidosCount ?? 0).toLocaleString('es-AR') },
    { ...metricStyles[2], value: (cursosCount ?? 0).toLocaleString('es-AR') },
    { ...metricStyles[3], value: (authUsersError ? 0 : authUsers.length).toLocaleString('es-AR') },
  ]
  const formatUserName = (user: User) => {
    const metadata = user.user_metadata
    for (const key of ['nombre_completo', 'name', 'full_name']) {
      const value: unknown = metadata[key]
      if (typeof value === 'string' && value.trim()) return value.trim()
    }
    return 'Usuario sin nombre'
  }

  return (
    <section id="dashboard" className="scroll-mt-24">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#54745c]">{fechaCapitalizada}</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-stone-800 sm:text-[28px]">Resumen general</h1>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="rounded-xl border-stone-200 bg-white py-0 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0"><p className="text-sm font-medium text-stone-500">{label}</p><p className="mt-3 text-[26px] font-semibold leading-none tracking-tight text-stone-800">{value}</p></div>
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${color}`}><Icon className="size-[18px]" /></span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section id="familias" className="mt-8 scroll-mt-24 rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-stone-100 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
          <div><h2 className="text-base font-semibold text-stone-800">Registros recientes</h2><p className="mt-1 text-xs text-stone-500">Últimos usuarios creados en Supabase Auth.</p></div>
          <Link href="/admin/familias" className={buttonVariants({ variant: 'outline', className: 'h-8 w-fit rounded-lg border-stone-200 px-3 text-xs text-stone-600' })}>Ver historial <ChevronRight data-icon="inline-end" /></Link>
        </div>
        {authUsersError ? (
          <p role="alert" className="px-5 py-8 text-center text-sm text-rose-700">No pudimos cargar los usuarios. Verifica que SUPABASE_SERVICE_ROLE_KEY esté configurada y que el servicio de autenticación esté disponible.</p>
        ) : recentUsers.length === 0 ? (
          <Table><TableBody><TableRow><TableCell colSpan={4} className="h-24 text-center text-sm text-stone-500">Aún no hay usuarios registrados</TableCell></TableRow></TableBody></Table>
        ) : (
          <Table>
            <TableHeader><TableRow className="hover:bg-transparent"><TableHead className="min-w-[190px] pl-5">Usuario</TableHead><TableHead className="min-w-[220px]">Correo electrónico</TableHead><TableHead className="min-w-[140px]">Fecha de registro</TableHead><TableHead className="min-w-[140px] pr-5">Último acceso</TableHead></TableRow></TableHeader>
            <TableBody>
              {recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="pl-5 text-sm font-medium text-stone-800">{formatUserName(user)}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-stone-600">{user.email ?? '—'}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm tabular-nums text-stone-500">{formatDate(user.created_at)}</TableCell>
                    <TableCell className="whitespace-nowrap pr-5 text-sm tabular-nums text-stone-500">{formatDate(user.last_sign_in_at ?? null)}</TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <p className="mt-7 flex items-center justify-center gap-2 text-xs text-stone-400"><ShieldCheck className="size-3.5" /> Datos actualizados desde Supabase</p>
    </section>
  )
}
