import { ImmersiveClassPlayer } from '@/components/immersive-class-player'
import { createClient } from '@/utils/supabase/server'

export default async function ClassPlayerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const nombreCompleto = user?.user_metadata?.nombre_completo
  const nombreUsuario = typeof nombreCompleto === 'string' && nombreCompleto.trim()
    ? nombreCompleto.trim()
    : 'Estudiante'
  const iniciales = nombreUsuario
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toLocaleUpperCase() ?? '')
    .join('') || 'E'

  return <ImmersiveClassPlayer initials={iniciales} />
}