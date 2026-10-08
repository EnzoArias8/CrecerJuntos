'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Heart, MailCheck } from 'lucide-react'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function RegisterPage() {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [registrationComplete, setRegistrationComplete] = useState(false)

  async function handleRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!strongPassword.test(password)) {
      setError('Usa al menos 8 caracteres, una mayúscula, un número y un carácter especial (@$!%*?&).')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo: name,
        },
      },
    })

    if (error) {
      setError(error.message)
      return
    }

    if (data.user) {
      setStep(2)
    }
  }

  function handleVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!/^\d{6}$/.test(verificationCode)) {
      setError('Ingresa un código de 6 dígitos.')
      return
    }

    setRegistrationComplete(true)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 py-10 text-stone-800">
      <div className="w-full max-w-md">
        <Button
          nativeButton={false}
          render={<Link href="/" />}
          variant="ghost"
          className="mb-4 h-9 rounded-lg px-3 text-sm text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft data-icon="inline-start" /> Volver al inicio
        </Button>

        <Card className="rounded-2xl border-stone-200 bg-white py-0 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-7 flex flex-col items-center text-center">
              <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#dce9dc] text-[#54745c]">
                {registrationComplete ? <CheckCircle2 aria-hidden="true" /> : step === 2 ? <MailCheck aria-hidden="true" /> : <Heart aria-hidden="true" />}
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-stone-800">
                {registrationComplete ? '¡Registro completado!' : step === 2 ? 'Revisa tu correo' : 'Únete a Crecer Juntos'}
              </h1>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                {registrationComplete
                  ? 'Código verificado. El flujo de registro de demostración finalizó.'
                  : step === 2
                    ? <>Te enviamos un código de 6 dígitos a <span className="font-medium text-stone-700">{email}</span></>
                    : 'Crea tu cuenta para comenzar a aprender con nosotras.'}
              </p>
            </div>

            {registrationComplete ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 rounded-xl bg-[#edf3eb] px-4 py-3 text-sm text-[#45624c]">
                  <CheckCircle2 className="size-4 shrink-0" /> Cuenta lista para continuar.
                </div>
                <Link href="/login" className="flex h-11 w-full items-center justify-center rounded-xl bg-[#C07A60] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#a9634d]">Ir a iniciar sesión</Link>
              </div>
            ) : step === 2 ? (
              <form onSubmit={handleVerification} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="verification-code" className="text-sm font-medium text-stone-700">Código de verificación</label>
                  <Input
                    id="verification-code"
                    name="verificationCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(event) => { setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                    placeholder="000000"
                    aria-label="Código de 6 dígitos"
                    className="h-12 rounded-xl border-stone-300 bg-white px-3 text-center text-xl tracking-[0.35em]"
                  />
                </div>
                {error && <p role="alert" className="text-sm leading-5 text-rose-700">{error}</p>}
                <Button type="submit" className="h-11 w-full rounded-xl bg-[#C07A60] text-sm font-semibold text-white shadow-sm hover:bg-[#a9634d]">Verificar código</Button>
                <Button type="button" variant="ghost" onClick={() => { setStep(1); setError('') }} className="h-10 w-full rounded-xl text-sm text-stone-600 hover:text-stone-900">Volver</Button>
              </form>
            ) : (
              <form onSubmit={handleRegistration} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="full-name" className="text-sm font-medium text-stone-700">Nombre completo</label>
                  <Input id="full-name" name="name" type="text" autoComplete="name" required value={name} onChange={(event) => { setName(event.target.value); setError('') }} placeholder="Tu nombre completo" className="h-11 rounded-xl border-stone-300 bg-white px-3" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-stone-700">Correo electrónico</label>
                  <Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); setError('') }} placeholder="Tu correo electrónico" className="h-11 rounded-xl border-stone-300 bg-white px-3" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-stone-700">Contraseña</label>
                  <Input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} placeholder="Crea una contraseña" className="h-11 rounded-xl border-stone-300 bg-white px-3" />
                  <p className="text-xs leading-5 text-stone-500">Mínimo 8 caracteres, con mayúscula, número y carácter especial.</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium text-stone-700">Repetir contraseña</label>
                  <Input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setError('') }} placeholder="Escribe de nuevo tu contraseña" className="h-11 rounded-xl border-stone-300 bg-white px-3" />
                </div>
                {error && <p role="alert" className="text-sm leading-5 text-rose-700">{error}</p>}
                <Button type="submit" className="h-11 w-full rounded-xl bg-[#C07A60] text-sm font-semibold text-white shadow-sm hover:bg-[#a9634d]">Crear cuenta</Button>
              </form>
            )}

            {!registrationComplete && <p className="mt-6 text-center text-sm text-stone-500">¿Ya tienes cuenta?{' '}<Link href="/login" className="font-medium text-[#54745c] underline-offset-4 hover:underline">Iniciar sesión</Link></p>}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}