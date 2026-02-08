import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-11-20.acacia",
})

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role for server-side
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")!

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
        console.error(`Webhook signature verification failed:`, err.message)
        return NextResponse.json({ error: err.message }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session

            // Get invoice ID from metadata
            const invoiceId = session.metadata?.invoiceId

            if (invoiceId && session.payment_intent) {
                // Create payment record
                const { error: paymentError } = await supabase.from("payments").insert({
                    invoice_id: invoiceId,
                    amount: (session.amount_total || 0) / 100, // Convert from cents
                    payment_method: "stripe",
                    payment_status: "completed",
                    stripe_payment_intent_id: session.payment_intent as string,
                    transaction_id: session.id,
                    payment_date: new Date().toISOString(),
                })

                if (paymentError) {
                    console.error("Error creating payment record:", paymentError)
                }

                // Update invoice status
                const { error: invoiceError } = await supabase
                    .from("invoices")
                    .update({ status: "paid" })
                    .eq("id", invoiceId)

                if (invoiceError) {
                    console.error("Error updating invoice:", invoiceError)
                }
            }
            break

        case "payment_intent.payment_failed":
            const failedIntent = event.data.object as Stripe.PaymentIntent
            console.error("Payment failed:", failedIntent.id)
            // Handle failed payment
            break

        default:
            console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
}
