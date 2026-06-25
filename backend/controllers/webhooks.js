import Stripe from "stripe"
import Transaction from "../models/Transaction.js"
import User from "../models/User.js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const stripewebwooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // 🔥 FIX 1: use req.body (raw middleware provides Buffer here)
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature failed", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    // 🔥 FIX 2: use checkout.session.completed (correct event)
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        // 🔥 FIX 3: directly use session metadata (NO stripe lookup needed)
        const { transactionId, appId } = session.metadata || {};

        if (!transactionId) {
          console.error("Missing transactionId in metadata");
          return res.status(400).json({ error: "Missing transactionId" });
        }

        if (appId !== "habeshagpt") {
          return res.json({ received: true, message: "ignored app" });
        }

        const transaction = await Transaction.findOne({
          _id: transactionId,
          isPaid: false,
        });

        if (!transaction) {
          return res.status(404).json({ error: "Transaction not found" });
        }

        // 🔥 ADD CREDITS
        await User.updateOne(
          { _id: transaction.userId },
          { $inc: { credits: transaction.credits } }
        );

        transaction.isPaid = true;
        await transaction.save();

        return res.json({ received: true });
      }

      default:
        return res.json({ received: true });
    }
  } catch (error) {
    console.error("Webhook Processing error:", error);
    return res.status(500).send("Internal Server Error");
  }
};