import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe";

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2024-06-20",
  });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);
  } catch (err: any) {
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const paymentIntentId = checkoutSession.payment_intent as string;
    const { session_id, block_id } = checkoutSession.metadata ?? {};

    if (block_id) {
      // Mark every session in the block as paid
      const { data: blockSessions } = await supabase
        .from("sessions")
        .select("id")
        .filter("metadata->>block_id", "eq", block_id);

      if (blockSessions && blockSessions.length > 0) {
        await supabase
          .from("sessions")
          .update({ paid: true, stripe_payment_intent_id: paymentIntentId })
          .in(
            "id",
            blockSessions.map((s: { id: string }) => s.id),
          );
      }
    } else if (session_id) {
      await supabase
        .from("sessions")
        .update({ paid: true, stripe_payment_intent_id: paymentIntentId })
        .eq("id", session_id);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
