import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe";
import { detailsTable, emailTemplate, formatDate, para, sendEmail } from "../_shared/email.ts";

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  if (!signature) return new Response("Missing stripe-signature header", { status: 400 });

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });

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
    const amountPounds = ((checkoutSession.amount_total ?? 0) / 100).toFixed(2);
    const { session_id, block_id } = checkoutSession.metadata ?? {};

    let clientId: string | null = null;
    let sessionDescription = "a counselling session";
    let sessionDate: string | null = null;

    if (block_id) {
      const { data: blockSessions } = await supabase
        .from("sessions")
        .select("id, client_id, scheduled_at")
        .filter("metadata->>block_id", "eq", block_id);

      if (blockSessions && blockSessions.length > 0) {
        clientId = blockSessions[0].client_id;
        sessionDescription = `a block of ${blockSessions.length} sessions`;
        await supabase
          .from("sessions")
          .update({ paid: true, stripe_payment_intent_id: paymentIntentId })
          .in(
            "id",
            blockSessions.map((s: { id: string }) => s.id),
          );
      }
    } else if (session_id) {
      const { data: sess } = await supabase
        .from("sessions")
        .select("client_id, scheduled_at")
        .eq("id", session_id)
        .single();

      if (sess) {
        clientId = sess.client_id;
        sessionDate = formatDate(sess.scheduled_at);
        sessionDescription = sessionDate;
        await supabase
          .from("sessions")
          .update({ paid: true, stripe_payment_intent_id: paymentIntentId })
          .eq("id", session_id);
      }
    }

    if (clientId) {
      const [{ data: clientProfile }, { data: adminRow }] = await Promise.all([
        supabase.from("users").select("first_name, last_name").eq("id", clientId).single(),
        supabase.from("users").select("id").eq("role", "admin").limit(1).single(),
      ]);

      const clientName = clientProfile
        ? `${clientProfile.first_name ?? ""} ${clientProfile.last_name ?? ""}`.trim()
        : "A client";

      const appUrl = (Deno.env.get("APP_URL") ?? "").replace(/\/$/, "");
      const resendKey = Deno.env.get("RESEND_API_KEY");
      const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
      const adminEmail = Deno.env.get("ADMIN_EMAIL");

      const html = emailTemplate({
        label: "Payment Received",
        title: `${clientName} has paid`,
        body:
          para(
            `A payment of <strong style="color:#2d2926;">£${amountPounds}</strong> has been received for ${sessionDescription}.`,
          ) +
          detailsTable([
            { label: "Client", value: clientName, bold: true },
            { label: "Amount", value: `£${amountPounds}` },
            { label: "Session", value: sessionDescription },
          ]),
        cta: { label: "View client page", url: `${appUrl}/admin/clients/${clientId}` },
        footerNote: "This email was sent because a client completed a payment through the WithMe portal.",
      });

      await Promise.all([
        adminRow
          ? supabase.from("notifications").insert({
              user_id: adminRow.id,
              type: "payment_received",
              message: `${clientName} paid £${amountPounds} for ${sessionDescription}`,
            })
          : Promise.resolve(),

        adminEmail && resendKey && fromEmail
          ? sendEmail({
              to: adminEmail,
              subject: `Payment received — ${clientName} (£${amountPounds})`,
              html,
              resendKey,
              fromEmail,
            })
          : Promise.resolve(),
      ]);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
