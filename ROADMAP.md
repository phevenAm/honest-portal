# Honest Portal — Feature Roadmap

## Build order

| # | Section | Status | Depends on |
|---|---------|--------|------------|
| 1 | Check-ins rework: tag-based chart aggregation | In progress | — |
| 2 | Show client reflections (free-text answers) | Queued | — |
| 0 | Email-sending capability (Resend + Edge Function) | Queued | — |
| 3 | Scheduler (sessions, reminders, cancellation) | Queued | 0 |
| 6 | Audit log for admin actions | Queued | 3 |
| 4 | Safeguarding alert | Queued | 0 |
| 5 | Attendance / cancellation analytics | Queued | 3 |
| 7 | Intake → signup bridge (marketing site) | Queued | 0, 3 |
| 8 | Weekly digest email to admin | Queued | 0 |
| 9 | Smaller items (2FA, richer question types, resource tagging) | Queued | — |

---

## Section 0 — Email-sending capability

Unblocks: 3, 4, 7, 8.

- Provider: **Resend** (free tier, 3k emails/month). Edge Functions run Deno — import as `npm:resend`.
- Single Edge Function `supabase/functions/send-email/index.ts` with generic `{ to, subject, html }` interface.
- API key stored in Supabase secrets (`supabase secrets set RESEND_API_KEY=...`).
- Cron mechanism: **pg_cron** (keeps scheduling logic next to the DB, not Netlify Scheduled Functions).

---

## Section 1 — Check-ins rework: tag-based aggregation

Fixes the current broken behaviour where the chart only reads `assignedQs[0]` and plots raw question text per line.

**DB changes:**
- New `tags` table: `id`, `name` (unique), `created_at`.
- Add nullable `tag_id` to `questions`.
- RLS: admins manage tags; all authenticated users can select.

**App changes:**
- New `tagsSlice.tsx` — fetchTags / createTag / updateTag / deleteTag.
- `AdminQuestionnairesPage.tsx`: tag `<Select>` on scale-question form with inline "+ create" option.
- `ProgressChart.tsx`: replace `buildChartData` with tag-based aggregator. Props change: `{ responses, questionnaire }` → `{ responses, questions }`. Chart lines map over tags, not questions. Data key = tag id; `name` prop = tag name.
- `ClientDashboard.tsx`: fetch responses for **all** assigned questionnaires, flatten questions, pass to chart.
- Drop `RadarView` (already disabled) during this refactor.
- UI copy: "Questionnaires" → "Check-ins" in labels only — leave DB names as-is.
- Tests: pure aggregation function tested with `test.each`.

---

## Section 2 — Show client reflections

No DB changes — read-only on existing data.

- Pure helper `extractReflections(responses, questions)` → `{ date, questionText, answer }[]`.
- New `ReflectionsList` component — used on `ClientDashboard.tsx` and inside admin per-client view.
- Extend `CustomTooltip` in `ProgressChart.tsx` to render reflections attached to each chart data point.

---

## Section 3 — Scheduler

Ship v1 first (manual scheduling + simple reminder email), then v2 (auto-cancel).

**DB:**
- `sessions` table: `id`, `client_id` → `auth.users` (set null on delete), `stub_id` → `client_stubs` (cascade), `scheduled_at`, `status` (scheduled/confirmed/cancelled/completed/no_show), `paid boolean`, `created_by`, `created_at`.
- Optional: `session_change_requests` for client-initiated reschedules requiring admin confirmation.

**Backend (needs Section 0):**
- Daily pg_cron → Edge Function: sessions 4 days out, unpaid/unconfirmed → reminder. 2 days out, still unpaid → flip to `cancelled`, email both parties.

**Frontend:**
- `sessionsSlice.tsx` — fetchByClient, fetchAll, create, updateStatus, requestReschedule.
- `AdminScheduler.tsx`: list grouped by client. Per-session: cancel, move date, bulk actions.
- `ClientSchedule.tsx`: upcoming sessions, cancel/reschedule-request buttons (creates pending change, no direct mutation).

---

## Section 4 — Safeguarding alert

**Resolve before writing any code:** get the clinical trigger rule from the practitioner (threshold vs. week-over-week trend — different implementation).

- Add `is_safeguarding boolean default false` to `tags` (reuses Section 1 table).
- New `safeguarding_flags` table: `client_id`, `response_id`, `reason`, `created_at`, `acknowledged boolean`.
- In `responsesSlice.tsx` submit thunk: on success, check new response against flagged tags; insert flag if triggered.
- Admin UI: unacknowledged-flag banner on dashboards + acknowledge action.
- Optional: email admin via Section 0 infra.

---

## Section 5 — Attendance / cancellation analytics

Depends on Section 3.

- Pure aggregation function: `{ attended, cancelled, noShow, paidLate }` counts/rates from a client's sessions.
- Stats block on admin per-client view alongside the progress chart.

---

## Section 6 — Audit log for admin actions

Ship right after Section 3 — scheduling and cancellation are the most sensitive admin actions.

- New `audit_log` table: `id`, `admin_id`, `action`, `target_table`, `target_id`, `metadata jsonb`, `created_at`.
- Thin `logAudit()` helper called explicitly from specific admin thunks (note edits, deletions, resource publish/unpublish, session mutations). Not a catch-all trigger.
- Read-only paginated view on `AdminDashboard.tsx` or its own page.

---

## Section 7 — Intake → signup bridge

Depends on Section 0 (email) and practically Section 3 (clients need scheduling on arrival).

- Contact/booking form on the marketing site posting to a new Supabase Edge Function.
- `request-access` Edge Function: validates submission, inserts into `platform_access_token`, emails token + signup link to applicant, notifies admin.
- Rate-limit / captcha required — public unauthenticated entry point.

---

## Section 8 — Weekly digest email to admin

Depends on Section 0.

- Weekly pg_cron → Edge Function: query overdue check-ins, sessions needing confirmation, unacknowledged safeguarding flags.
- Short summary email to admin address.

---

## Section 9 — Smaller items

- **2FA for admin login** — Supabase Auth TOTP MFA. Frontend: enroll/verify screens, gate in `AuthContext.tsx` / `ProtectedRoute.tsx` for admin role.
- **Richer question types** — extend `QuestionType` beyond scale/text. Touches `Question` type, renderer in `CheckInPage.tsx`, admin question form.
- **Resource tagging/search** — reuse `tags` from Section 1 (no second tags concept). Add `tag_id` to `resources`, filter controls to resource pages.
