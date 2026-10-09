import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { PayPalProvider } from '@/components/paypal-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Crecer Juntos | Psicopedagogía para familias',
  description: 'Cursos y herramientas prácticas para acompañar el desarrollo y aprendizaje de tus hijos con calma y conexión.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased">
        <PayPalProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </PayPalProvider>
      </body>
    </html>
  )
}
