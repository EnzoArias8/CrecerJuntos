import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titulo, precio, cursoId, email } = body;

    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN! 
    });
    
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        external_reference: String(cursoId),
        items: [
          {
            id: String(cursoId),
            title: String(titulo),
            quantity: 1,
            unit_price: Number(precio),
            currency_id: "ARS",
          }
        ],
        payer: {
          email: String(email)
        },
        back_urls: {
          success: "http://localhost:3000/mis-cursos",
          failure: "http://localhost:3000/checkout",
          pending: "http://localhost:3000/mis-cursos"
        }
        // Eliminamos el auto_return para que MP no bloquee localhost
      }
    });

    return NextResponse.json({ init_point: result.init_point });
    
  } catch (error) {
    console.error("Detalle del error MP:", error);
    return NextResponse.json(
      { error: "Error al crear la preferencia de pago" }, 
      { status: 500 }
    );
  }
}
