import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { detailsTable, emailTemplate, formatDate, noteBox, para, sendEmail } from "../_shared/email.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200 });

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
  if (!resendKey || !fromEmail) {
    return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY or RESEND_FROM_EMAIL" }), { status: 500 });
  }

  const appUrl = (Deno.env.get("APP_URL") ?? "").replace(/\/$/, "");
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const now = Date.now();
  const windowFrom = new Date(now + 4.5 * 24 * 60 * 60 * 1000).toISOString();
  const windowTo = new Date(now + 5.5 * 24 * 60 * 60 * 1000).toISOString();

  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("id, scheduled_at, duration_minutes, paid, location, client_id")
    .gte("scheduled_at", windowFrom)
    .lte("scheduled_at", windowTo)
    .neq("status", "cancelled");

  if (sessionsError) {
    return new Response(JSON.stringify({ error: sessionsError.message }), { status: 500 });
  }

  if (!sessions || sessions.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: "No sessions in window" }), { status: 200 });
  }

  const clientIds = [...new Set(sessions.map((s: any) => s.client_id as string))];

  const { data: profiles } = await supabase.from("users").select("id, first_name").in("id", clientIds);
  const nameMap: Record<string, string> = {};
  for (const p of profiles ?? []) nameMap[p.id] = p.first_name ?? "there";

  const emailMap: Record<string, string> = {};
  await Promise.all(
    clientIds.map(async (id) => {
      const { data } = await supabase.auth.admin.getUserById(id);
      if (data?.user?.email) emailMap[id] = data.user.email;
    }),
  );

  const results = await Promise.allSettled(
    sessions.map(async (session: any) => {
      const toEmail = emailMap[session.client_id];
      if (!toEmail) throw new Error(`No email for client ${session.client_id}`);

      const firstName = nameMap[session.client_id] ?? "there";
      const dateStr = formatDate(session.scheduled_at);
      const locationLabel = session.location !== "in_person" ? "Online" : "In person";

      const sessionDetails = detailsTable([
        { label: "Date & time", value: dateStr, bold: true },
        { label: "Duration", value: `${session.duration_minutes} minutes` },
        { label: "Location", value: locationLabel },
      ]);

      const html = session.paid
        ? emailTemplate({
            label: "Session Reminder",
            title: `Hi ${firstName},`,
            body:
              para("This is a friendly reminder that you have a confirmed session coming up in 5 days.") +
              sessionDetails +
              noteBox("If you need to cancel or reschedule, please do so at least 48 hours before your session."),
            footerNote: "This email was sent because you have a session booked through the WithMe portal.",
          })
        : emailTemplate({
            label: "Session Reminder",
            title: `Hi ${firstName},`,
            body:
              para(
                `You have a session coming up in 5 days. <strong style="color:#2d2926;">Your session has not been paid yet.</strong> Please pay at least 48 hours before your session to keep your booking.`,
              ) +
              sessionDetails +
              noteBox(
                "Sessions that remain unpaid within 48 hours of the appointment may be cancelled. If you have any questions, please reply to this email.",
              ),
            cta: { label: "Pay now", url: `${appUrl}/my-sessions` },
            footerNote: "This email was sent because you have a session booked through the WithMe portal.",
          });

      const subject = session.paid
        ? `Reminder: your session on ${dateStr}`
        : `Action needed: please pay for your session on ${dateStr}`;

      await sendEmail({ to: toEmail, subject, html, resendKey, fromEmail });
    }),
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
  if (failed.length) failed.forEach((f) => console.error(f.reason));

  return new Response(JSON.stringify({ sent, failed: failed.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
