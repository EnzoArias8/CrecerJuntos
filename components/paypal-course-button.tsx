'use client'

import { PayPalButtons } from '@paypal/react-paypal-js'

type PayPalCourseButtonProps = {
	courseTitle: string
	amount: string
}

export function PayPalCourseButton({ courseTitle, amount }: PayPalCourseButtonProps) {
	return (
		<PayPalButtons
			style={{ color: 'blue', layout: 'horizontal', label: 'pay', shape: 'rect', tagline: false }}
			createOrder={(_data, actions) => actions.order.create({
				intent: 'CAPTURE',
				purchase_units: [
					{
						description: `Curso: ${courseTitle}`,
						amount: {
							currency_code: 'USD',
							value: amount,
						},
					},
				],
			})}
			onApprove={async (_data, actions) => {
				const order = await actions.order?.capture()
				console.log('Pago completado:', order)
				window.alert('¡Pago exitoso! En breve te daremos acceso al curso.')
			}}
			onError={(error) => {
				console.error('Error al procesar el pago con PayPal:', error)
				window.alert('No se pudo procesar el pago con PayPal. Inténtalo nuevamente.')
			}}
		/>
	)
}