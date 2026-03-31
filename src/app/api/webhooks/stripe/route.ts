import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const plan = session.metadata?.plan;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (userId && plan) {
        await getSupabaseAdmin()
          .from("profiles")
          .update({
            plan,
            stripe_subscription_id: subscriptionId,
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      if (subscription.status === "active") {
        // Plan was updated - keep current plan
      } else if (
        subscription.status === "canceled" ||
        subscription.status === "unpaid"
      ) {
        const { data } = await getSupabaseAdmin()
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (data) {
          await getSupabaseAdmin()
            .from("profiles")
            .update({
              plan: "free",
              stripe_subscription_id: null,
            })
            .eq("id", data.id);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const { data } = await getSupabaseAdmin()
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (data) {
        await getSupabaseAdmin()
          .from("profiles")
          .update({
            plan: "free",
            stripe_subscription_id: null,
          })
          .eq("id", data.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
