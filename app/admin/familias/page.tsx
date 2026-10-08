import { createClient as createSupabaseAdmin, type User } from '@supabase/supabase-js'

import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const dynamic = 'force-dynamic'

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

function formatUserName(user: User) {
  const metadata = user.user_metadata
  for (const key of ['nombre_completo', 'name', 'full_name']) {
    const value: unknown = metadata[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return 'Usuario sin nombre'
}

export default async function AdminFamiliesPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return (
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-800 sm:text-[28px]">Registros</h1>
          <p className="mt-1.5 text-sm text-stone-500">Consulta las cuentas y los datos de los usuarios registrados.</p>
        </header>
        <p role="alert" className="rounded-xl border border-rose-200 bg-white p-8 text-sm text-rose-700">No pudimos cargar los usuarios. Verifica que SUPABASE_SERVICE_ROLE_KEY esté configurada.</p>
      </section>
    )
  }

  const supabaseAdmin = createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const users: User[] = []
  let errorMessage: string | null = null
  let page = 1
  const pageSize = 1000

  while (!errorMessage) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: pageSize })
    if (error) {
      errorMessage = error.message
      break
    }

    users.push(...data.users)
    if (data.users.length < pageSize) break
    page += 1
  }

  const sortedUsers = users.sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime())

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-800 sm:text-[28px]">Registros</h1>
        <p className="mt-1.5 text-sm text-stone-500">Consulta las cuentas y los datos de los usuarios registrados.</p>
      </header>

      <Card className="overflow-hidden rounded-xl border-stone-200 bg-white py-0 shadow-sm">
        {errorMessage ? (
          <p role="alert" className="p-8 text-sm text-rose-700">No pudimos cargar los usuarios de Supabase Auth: {errorMessage}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[190px] pl-5">Nombre</TableHead>
                <TableHead className="min-w-[220px]">Correo electrónico</TableHead>
                <TableHead className="min-w-[140px]">Fecha de registro</TableHead>
                <TableHead className="min-w-[140px] pr-5">Último acceso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center text-sm text-stone-500">No hay usuarios registrados.</TableCell></TableRow>
              ) : sortedUsers.map((user) => (
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
      </Card>
    </section>
  )
}
