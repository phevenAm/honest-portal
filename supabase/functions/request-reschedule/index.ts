// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { session_id, requested_at, message } = await req.json();
    if (!session_id || !requested_at) {
      return new Response(JSON.stringify({ error: "Missing session_id or requested_at" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { error: insertError } = await supabase.from("reschedule_requests").insert({
      session_id,
      client_id: user.id,
      requested_at,
      message: message ?? null,
    });
    if (insertError) throw insertError;

    const [{ data: client }, { data: session }, { data: admins }] = await Promise.all([
      supabase.from("users").select("first_name, last_name").eq("id", user.id).single(),
      supabase.from("sessions").select("scheduled_at").eq("id", session_id).single(),
      supabase.from("users").select("id").eq("role", "admin"),
    ]);

    const clientName = client ? `${client.first_name} ${client.last_name}` : "A client";
    const appUrl = (Deno.env.get("APP_URL") ?? "").replace(/\/$/, "");

    if (admins && admins.length > 0) {
      await supabase.from("notifications").insert(
        admins.map((a: { id: string }) => ({
          user_id: a.id,
          type: "reschedule_request",
          message: `${clientName} requested to move their session${session?.scheduled_at ? ` from ${fmt(session.scheduled_at)}` : ""} to ${fmt(requested_at)}.`,
        })),
      );
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: Deno.env.get("RESEND_FROM_EMAIL"),
        to: Deno.env.get("ADMIN_EMAIL"),
        subject: `Reschedule request — ${clientName}`,
        html: `
<div style="background:#f3f0eb;padding:40px 20px;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;">

    <div style="background:#8bb898;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
      <div style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:26px;">&#9679;</div>
      <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:500;color:#fff;margin:0;letter-spacing:0.02em;">WithMe</h1>
      <p style="font-size:13px;color:rgba(255,255,255,0.8);margin:6px 0 0;font-family:system-ui,sans-serif;">A safe space for your journey</p>
    </div>

    <div style="background:#ffffff;padding:44px 40px 36px;border-left:1px solid #e0dbd4;border-right:1px solid #e0dbd4;">
      <p style="font-family:system-ui,sans-serif;font-size:13px;color:#9e9894;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.08em;">Session Update</p>
      <h2 style="font-family:Georgia,serif;font-size:26px;font-weight:500;color:#2d2926;margin:0 0 20px;line-height:1.3;">Reschedule request from ${clientName}</h2>

      <p style="font-family:system-ui,sans-serif;font-size:15px;color:#6b6460;line-height:1.75;margin:0 0 28px;">
        Your client would like to move their upcoming session to a new date and time. Review the details below and update the session on their client page.
      </p>

      <div style="background:#f3f0eb;border-radius:12px;padding:20px 24px;margin:0 0 28px;">
        <p style="font-family:system-ui,sans-serif;font-size:13px;color:#9e9894;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.08em;">Details</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="font-family:system-ui,sans-serif;font-size:14px;color:#9e9894;padding:5px 0;width:150px;vertical-align:top;">Current date</td>
            <td style="font-family:system-ui,sans-serif;font-size:14px;color:#2d2926;padding:5px 0;">${fmt(session?.scheduled_at)}</td>
          </tr>
          <tr>
            <td style="font-family:system-ui,sans-serif;font-size:14px;color:#9e9894;padding:5px 0;vertical-align:top;">Requested date</td>
            <td style="font-family:system-ui,sans-serif;font-size:14px;color:#2d2926;font-weight:600;padding:5px 0;">${fmt(requested_at)}</td>
          </tr>
          ${message ? `<tr><td style="font-family:system-ui,sans-serif;font-size:14px;color:#9e9894;padding:5px 0;vertical-align:top;">Note</td><td style="font-family:system-ui,sans-serif;font-size:14px;color:#2d2926;padding:5px 0;">${message}</td></tr>` : ""}
        </table>
      </div>

      <div style="text-align:center;margin:0 0 36px;">
        <a href="${appUrl}/admin/clients/${user.id}" style="display:inline-block;background:#5a8a6a;color:#ffffff;font-family:system-ui,sans-serif;font-size:15px;font-weight:500;text-decoration:none;padding:14px 36px;border-radius:999px;letter-spacing:0.01em;">
          View client page &rarr;
        </a>
      </div>

      <div style="background:#f3f0eb;border-radius:12px;padding:18px 22px;">
        <p style="font-family:system-ui,sans-serif;font-size:13px;color:#9e9894;line-height:1.6;margin:0;">
          Log in and open the client page to reschedule their session. No action is taken automatically.
        </p>
      </div>
    </div>

    <div style="background:#2d2926;border-radius:0 0 16px 16px;padding:28px 40px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <div style="width:28px;height:28px;border-radius:50%;background:rgba(139,184,152,0.25);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">&#9679;</div>
        <span style="font-family:Georgia,serif;font-size:14px;color:#f0ece8;font-weight:500;">WithMe</span>
      </div>
      <p style="font-family:system-ui,sans-serif;font-size:12px;color:#706c68;line-height:1.7;margin:0 0 12px;">
        This email was sent because a client submitted a reschedule request through the WithMe portal.
      </p>
      <div style="border-top:1px solid #3a3834;padding-top:14px;display:flex;gap:20px;flex-wrap:wrap;">
        <a href="#" style="font-family:system-ui,sans-serif;font-size:12px;color:#8bb898;text-decoration:none;">Privacy policy</a>
        <a href="#" style="font-family:system-ui,sans-serif;font-size:12px;color:#8bb898;text-decoration:none;">Terms of service</a>
      </div>
    </div>

  </div>
</div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return new Response(JSON.stringify({ error: err }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
