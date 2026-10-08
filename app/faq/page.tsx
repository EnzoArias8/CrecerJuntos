import { MessageCircle, Sparkles } from 'lucide-react'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const questions = [
	{
		question: '¿Cómo accedo a los cursos?',
		answer: 'Después de completar tu inscripción, inicia sesión con tu correo y contraseña. Encontrarás tus cursos en la sección «Mis Cursos» y podrás continuar desde la clase que estabas viendo.',
	},
	{
		question: '¿Cuáles son los métodos de pago?',
		answer: 'Puedes pagar con Mercado Pago o con tarjeta de crédito o débito. El checkout te mostrará las opciones disponibles antes de confirmar la compra.',
	},
	{
		question: '¿Tienen vencimiento?',
		answer: 'No. Una vez inscrita, tendrás acceso ilimitado al curso para avanzar a tu ritmo y volver a consultar las lecciones cuando quieras.',
	},
	{
		question: '¿Puedo hacerlos desde el celular?',
		answer: 'Sí. La plataforma funciona desde el navegador de tu celular, tablet o computadora. Solo necesitas conexión a internet para ver las clases y consultar los materiales.',
	},
]

export default function FAQPage() {
	return (
		<div className="min-h-screen bg-stone-50 text-stone-800">
			<SiteHeader />
			<main className="mx-auto max-w-3xl px-5 pb-20 pt-3 sm:pt-4 lg:pb-24">
				<header className="mb-9 text-center sm:mb-12">
					<span className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-[#e7f0e7] text-[#54745c]">
						<MessageCircle className="size-5" aria-hidden="true" />
					</span>
					<p className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-[#54745c]"><Sparkles className="size-3.5" /> Estamos para ayudarte</p>
					<h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-stone-800 sm:text-4xl">Preguntas Frecuentes</h1>
					<p className="mt-3 text-base text-stone-600 sm:text-lg">Resolvemos tus dudas</p>
				</header>

				<section aria-label="Preguntas frecuentes">
					<Accordion className="border-t border-stone-200" defaultValue={[]}>
						{questions.map(({ question, answer }, index) => (
							<AccordionItem key={question} value={`faq-${index + 1}`}>
								<h2>
									<AccordionTrigger className="gap-5 py-5 text-base sm:text-[17px]">
										<span>{question}</span>
									</AccordionTrigger>
								</h2>
								<AccordionContent className="max-w-2xl pl-0 text-sm leading-7 text-stone-600 sm:text-base">
									{answer}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</section>
			</main>
			<SiteFooter />
		</div>
	)
}
