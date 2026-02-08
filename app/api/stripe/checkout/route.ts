import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-11-20.acacia",
})

export async function POST(request: Request) {
    try {
        const { invoiceId, amount, currency = "myr" } = await request.json()

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: "Invalid amount" },
                { status: 400 }
            )
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: `Invoice Payment`,
                            description: `Payment for invoice #${invoiceId}`,
                        },
                        unit_amount: Math.round(amount * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/${invoiceId}?cancelled=true`,
            metadata: {
                invoiceId,
            },
        })

        return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (error: any) {
        console.error("Stripe checkout error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to create checkout session" },
            { status: 500 }
        )
    }
}
