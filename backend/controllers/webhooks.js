import Stripe from "stripe"
import Transaction from "../models/Transaction.js"
import User from "../models/User.js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const stripewebwooks = async (req, res) => {
    const sig = req.headers["stripe-signature"]
    let event

    try {
        // Use raw body
        event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch(error) {
        console.error("Webhook signature failed", error.message)
        return res.status(400).send(`Webhook Error: ${error.message}`)
    }

    try {
        switch(event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object
                const sessionList = await stripe.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                    limit: 1
                })

                const session = sessionList.data[0]
                if (!session?.metadata) {
                    console.error("No metadata in session")
                    return res.status(400).json({error: "Invalid session"})
                }

                const { transactionId, appId } = session.metadata
                
                if (!transactionId) {
                    console.error("Missing transactionId in metadata")
                    return res.status(400).json({error: "Missing transactionId"})
                }

                if (appId === 'habeshagpt') {
                    // Atomic update to prevent race conditions
                    const transaction = await Transaction.findOne({_id: transactionId, isPaid: false})
                    
                    if (!transaction) {
                        console.error(`Transaction ${transactionId} not found or already paid`)
                        return res.status(404).json({error: "Transaction not found"})
                    }

                    // Update user credits
                    await User.updateOne(
                        {_id: transaction.userId}, 
                        {$inc: {credits: transaction.credits}}
                    )

                    // Mark transaction as paid
                    transaction.isPaid = true
                    await transaction.save()
                    
                    return res.json({received: true})
                } else {
                    return res.json({received: true, message: "Ignored event: Invalid app"})
                }
            }
            
            default:
                console.log("Unhandled event type:", event.type)
                return res.json({received: true})
        }
    } catch(error) {
        console.error("Webhook Processing error:", error)
        return res.status(500).send("Internal Server Error")
    }
}