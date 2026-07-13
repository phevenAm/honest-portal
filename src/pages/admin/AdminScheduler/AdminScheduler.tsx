// ─── ADMIN SCHEDULER — DEFERRED ───────────────────────────────────────────────
//
// This page is intentionally left as a stub. Per-client session management
// is handled in AdminClientsPageDetailed. Come back here when caseload grows
// and a bird's-eye view becomes necessary.
//
// PLANNED: Bird's-eye calendar view
//   - react-big-calendar week/month grid showing ALL sessions across ALL clients
//   - Each event block labelled with client name (look up from userDirectory by client_id)
//   - Click an event → jump to that client's AdminClientsPageDetailed
//   - Helps admin see scheduling gaps, conflicts, and busy weeks at a glance
//
// PLANNED: Session actions from the calendar
//   - Bulk select sessions via checkbox → bulk cancel or bulk reschedule
//   - Cancel / reschedule always fires a notification email to the client (requires Section 0 email infra)
//
// PLANNED: Email automation (requires Section 0 — Resend + Supabase Edge Function)
//   - 4 days before session: remind client to pay (if unpaid) or confirm attendance
//   - 2 days before session: if still unpaid and unconfirmed → auto-cancel, client must contact admin to rebook
//   - If admin has already marked session as paid → reminder email only (no payment prompt)
//   - Cancellation or date change always fires a notification email to the client
//
// PLANNED: Attendance analytics (overlaps with Section 5)
//   - Per-client stats: attendance rate, late payments, cancellations, with dates
//   - Could live here or be folded into AdminClientsPageDetailed stats bar

const AdminScheduler = () => {
  return (
    <div>
      <h1>AdminScheduler</h1>
    </div>
  );
};

export default AdminScheduler;
