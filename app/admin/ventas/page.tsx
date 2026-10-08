import { CreditCard, ReceiptText } from 'lucide-react'
import { createClient as createSupabaseAdmin, type User } from '@supabase/supabase-js'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createClient } from '@/utils/supabase/server'

type RelatedCourse = { titulo?: string | null; precio_ars?: number | string | null } | Array<{ titulo?: string | null; precio_ars?: number | string | null }> | null
type SaleRecord = {
  id: string | number
  created_at: string | null
  usuario_id: string | null
  cursos: RelatedCourse
  monto_abonado: number | string | null
  estado?: string | null
}

function getRelatedRecord<T>(record: T | T[] | null | undefined): T | null {
  if (record == null) return null
  return Array.isArray(record) ? record[0] ?? null : record
}

function formatPrice(value: number | string | null | undefined) {
  if (value == null || value === '') return '—'
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateValue: string | null) {
  if (!dateValue) return '—'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

function getStatusStyle(status: string) {
  const normalizedStatus = status.toLowerCase()
  if (normalizedStatus === 'activo' || normalizedStatus === 'active') return 'bg-[#e7f0e7] text-[#456d4d]'
  if (normalizedStatus === 'cancelado' || normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') return 'bg-rose-50 text-rose-700'
  return 'bg-[#f8efe3] text-[#9a6d30]'
}

export default async function AdminSalesPage() {
  const supabase = await createClient()
  const { data: ventas, error } = await supabase
    .from('accesos')
    .select('*, perfiles(nombre_completo, email), cursos(titulo, precio_ars)')
    .order('created_at', { ascending: false })
  const sales = (ventas ?? []) as SaleRecord[]
  const authUsers = new Map<string, User>()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  let authUsersError: string | null = null

  if (!supabaseUrl || !serviceRoleKey) {
    authUsersError = 'SUPABASE_SERVICE_ROLE_KEY no está configurada.'
  } else {
    const supabaseAdmin = createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    let page = 1
    const pageSize = 1000
    let hasMoreUsers = true

    while (hasMoreUsers) {
      const { data, error: usersError } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: pageSize })
      if (usersError) {
        authUsersError = usersError.message
        authUsers.clear()
        break
      }

      for (const user of data.users) authUsers.set(user.id, user)
      hasMoreUsers = data.users.length === pageSize
      page += 1
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="flex items-center gap-2 text-sm font-medium text-[#54745c]"><CreditCard className="size-4" /> ACTIVIDAD COMERCIAL</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-800 sm:text-[28px]">Historial de Ventas</h1>
        <p className="mt-1.5 text-sm text-stone-500">Consulta las inscripciones, cursos y estados de pago más recientes.</p>
      </header>

      <Card className="overflow-hidden rounded-xl border-stone-200 bg-white py-0 shadow-sm">
        {authUsersError && <p role="alert" className="border-b border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">No se pudieron asociar los correos de Supabase Auth: {authUsersError}</p>}
        {error ? (
          <div role="alert" className="p-8 text-center"><p className="font-medium text-stone-800">No pudimos cargar las ventas.</p><p className="mt-2 text-sm text-stone-500">{error.message}</p></div>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#edf1e9] text-[#54745c]"><ReceiptText className="size-5" /></span>
            <p className="mt-4 font-semibold text-stone-800">Todavía no hay ventas registradas</p>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-stone-500">Cuando se completen nuevas inscripciones, aparecerán aquí.</p>
          </div>
        ) : (
          <Table>
            <TableHeader><TableRow className="hover:bg-transparent"><TableHead className="min-w-[130px] pl-5">Fecha</TableHead><TableHead className="min-w-[220px]">Usuario</TableHead><TableHead className="min-w-[220px]">Curso</TableHead><TableHead className="min-w-[140px] text-right">Monto</TableHead><TableHead className="min-w-[140px] pr-5">Estado</TableHead></TableRow></TableHeader>
            <TableBody>
              {sales.map((sale, index) => {
                const course = getRelatedRecord(sale.cursos)
                const comprador = sale.usuario_id ? authUsers.get(sale.usuario_id) : undefined
                const status = sale.estado ?? 'pendiente'
                const amount = sale.monto_abonado ?? course?.precio_ars
                return <TableRow key={sale.id ?? index}><TableCell className="pl-5 tabular-nums text-sm text-stone-500">{formatDate(sale.created_at)}</TableCell><TableCell className="whitespace-nowrap text-sm font-medium text-stone-800">{comprador?.email || 'Usuario manual'}</TableCell><TableCell className="text-sm text-stone-600">{course?.titulo || '—'}</TableCell><TableCell className="text-right text-sm font-medium tabular-nums text-stone-800">{formatPrice(amount)}</TableCell><TableCell className="pr-5"><Badge className={`rounded-full px-2.5 font-medium capitalize ${getStatusStyle(status)}`}>{status}</Badge></TableCell></TableRow>
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </section>
  )
}