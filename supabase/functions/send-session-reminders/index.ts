import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });
}

function buildEmail(opts: {
  firstName: string;
  dateStr: string;
  durationMins: number;
  isOnline: boolean;
  paid: boolean;
  appUrl: string;
}): { subject: string; html: string } {
  const { firstName, dateStr, durationMins, isOnline, paid, appUrl } = opts;
  const locationLabel = isOnline ? "Online" : "In person";

  const subject = paid
    ? `Reminder: your session on ${dateStr}`
    : `Action needed: please pay for your session on ${dateStr}`;

  const bodyContent = paid
    ? `
      <p style="font-family:system-ui,sans-serif;font-size:15px;color:#6b6460;line-height:1.75;margin:0 0 28px;">
        This is a friendly reminder that you have a session coming up in 5 days. Your booking is confirmed and paid.
      </p>

      <div style="background:#f3f0eb;border-radius:12px;padding:20px 24px;margin:0 0 28px;">
        <p style="font-family:system-ui,sans-serif;font-size:13px;color:#9e9894;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.08em;">Session details</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="font-family:system-ui,sans-serif;font-size:14px;color:#9e9894;padding:5px 0;width:130px;">Date &amp; time</td>
            <td style="font-family:system-ui,sans-serif;font-size:14px;color:#2d2926;font-weight:600;padding:5px 0;">${dateStr}</td>
          </tr>
          <tr>
            <td style="font-family:system-ui,sans-serif;font-size:14px;color:#9e9894;padding:5px 0;">Duration</td>
            <td style="font-family:system-ui,sans-serif;font-size:14px;color:#2d2926;padding:5px 0;">${durationMins} minutes</td>
          </tr>
          <tr>
            <td style="font-family:system-ui,sans-serif;font-size:14px;color:#9e9894;padding:5px 0;">Location</td>
            <td style="font-family:system-ui,sans-serif;font-size:14px;color:#2d2926;padding:5px 0;">${locationLabel}</td>
          </tr>
        </table>
      </div>

      <div style="background:#f3f0eb;border-radius:12px;padding:18px 22px;">
        <p style="font-family:system-ui,sans-serif;font-size:13px;color:#9e9894;line-height:1.6;margin:0;">
          If you need to cancel or reschedule, please do so at least 48 hours before your session.
        </p>
      </div>
    `
    : `
      <p style="font-family:system-ui,sans-serif;font-size:15px;color:#6b6460;line-height:1.75;margin:0 0 28px;">
        You have a session coming up in 5 days. <strong style="color:#2d2926;">Your session has not been paid yet.</strong>
        Please pay at least 48 hours before your session to keep your booking.
      </p>

      <div style="background:#f3f0eb;border-radius:12px;padding:20px 24px;margin:0 0 28px;">
        <p style="font-family:system-ui,sans-serif;font-size:13px;color:#9e9894;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.08em;">Session details</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="font-family:system-ui,sans-serif;font-size:14px;color:#9e9894;padding:5px 0;width:130px;">Date &amp; time</td>
            <td style="font-family:system-ui,sans-serif;font-size:14px;color:#2d2926;font-weight:600;padding:5px 0;">${dateStr}</td>
          </tr>
          <tr>
            <td style="font-family:system-ui,sans-serif;font-size:14px;color:#9e9894;padding:5px 0;">Duration</td>
            <td style="font-family:system-ui,sans-serif;font-size:14px;color:#2d2926;padding:5px 0;">${durationMins} minutes</td>
          </tr>
          <tr>
            <td style="font-family:system-ui,sans-serif;font-size:14px;color:#9e9894;padding:5px 0;">Location</td>
            <td style="font-family:system-ui,sans-serif;font-size:14px;color:#2d2926;padding:5px 0;">${locationLabel}</td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;margin:0 0 28px;">
        <a href="${appUrl}/my-sessions" style="display:inline-block;background:#5a8a6a;color:#ffffff;font-family:system-ui,sans-serif;font-size:15px;font-weight:500;text-decoration:none;padding:14px 36px;border-radius:999px;letter-spacing:0.01em;">
          Pay now &rarr;
        </a>
      </div>

      <div style="background:#f3f0eb;border-radius:12px;padding:18px 22px;">
        <p style="font-family:system-ui,sans-serif;font-size:13px;color:#9e9894;line-height:1.6;margin:0;">
          Sessions that remain unpaid within 48 hours of the appointment may be cancelled. If you have any questions, please reply to this email.
        </p>
      </div>
    `;

  const html = `
<div style="background:#f3f0eb;padding:40px 20px;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;">

    <div style="background:#8bb898;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
      <div style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:26px;">&#9679;</div>
      <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:500;color:#fff;margin:0;letter-spacing:0.02em;">WithMe</h1>
      <p style="font-size:13px;color:rgba(255,255,255,0.8);margin:6px 0 0;font-family:system-ui,sans-serif;">A safe space for your journey</p>
    </div>

    <div style="background:#ffffff;padding:44px 40px 36px;border-left:1px solid #e0dbd4;border-right:1px solid #e0dbd4;">
      <p style="font-family:system-ui,sans-serif;font-size:13px;color:#9e9894;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.08em;">Session Reminder</p>
      <h2 style="font-family:Georgia,serif;font-size:26px;font-weight:500;color:#2d2926;margin:0 0 20px;line-height:1.3;">Hi ${firstName},</h2>
      ${bodyContent}
    </div>

    <div style="background:#2d2926;border-radius:0 0 16px 16px;padding:28px 40px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <div style="width:28px;height:28px;border-radius:50%;background:rgba(139,184,152,0.25);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">&#9679;</div>
        <span style="font-family:Georgia,serif;font-size:14px;color:#f0ece8;font-weight:500;">WithMe</span>
      </div>
      <p style="font-family:system-ui,sans-serif;font-size:12px;color:#706c68;line-height:1.7;margin:0 0 12px;">
        This email was sent because you have a session booked through the WithMe portal.
      </p>
      <div style="border-top:1px solid #3a3834;padding-top:14px;display:flex;gap:20px;flex-wrap:wrap;">
        <a href="#" style="font-family:system-ui,sans-serif;font-size:12px;color:#8bb898;text-decoration:none;">Privacy policy</a>
        <a href="#" style="font-family:system-ui,sans-serif;font-size:12px;color:#8bb898;text-decoration:none;">Terms of service</a>
      </div>
    </div>

  </div>
</div>`;

  return { subject, html };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
  if (!resendKey || !fromEmail) {
    return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY or RESEND_FROM_EMAIL" }), { status: 500 });
  }

  const appUrl = (Deno.env.get("APP_URL") ?? "").replace(/\/$/, "");

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Sessions starting between 4.5 and 5.5 days from now
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

      const { subject, html } = buildEmail({
        firstName: nameMap[session.client_id] ?? "there",
        dateStr: formatDate(session.scheduled_at),
        durationMins: session.duration_minutes,
        isOnline: session.location !== "in_person",
        paid: session.paid,
        appUrl,
      });

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({ from: fromEmail, to: toEmail, subject, html }),
      });

      if (!res.ok) throw new Error(`Resend error for ${toEmail}: ${await res.text()}`);
    }),
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];

  if (failed.length) failed.forEach((f) => console.error(f.reason));

  return new Response(JSON.stringify({ sent, failed: failed.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
