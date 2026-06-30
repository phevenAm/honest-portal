import { useEffect, useState } from "react";

import Button from "@components/shared/Button/Button";
import Card from "@components/shared/Card/Card";
import type { AuditLog } from "@models/globalTypes";
import { useAppDispatch, useAppSelector, useFetchOnIdle } from "@store/hooks";
import type { RootState } from "@store/index";
import { fetchAuditLogs, resetAuditLogs, selectAllAuditLogs, selectAuditLogsStatus } from "@store/slices/auditLogsSlice";

import styles from "./AdminAuditLogsPage.module.scss";

const TABLE_LABELS: Record<string, string> = {
  users: "Client",
  questionnaires: "Check-in",
  questionnaire_assignments: "Assignment",
  resources: "Resource",
  tags: "Tag",
};

const ACTION_FILTERS = ["all", "INSERT", "UPDATE", "DELETE"] as const;
type ActionFilter = (typeof ACTION_FILTERS)[number];

const TABLE_FILTERS = ["all", "users", "questionnaires", "questionnaire_assignments", "resources", "tags"] as const;
type TableFilter = (typeof TABLE_FILTERS)[number];

function getTableLabel(name: string) {
  return TABLE_LABELS[name] ?? name;
}

function getActorName(log: AuditLog) {
  if (!log.actor) return "System";
  return `${log.actor.first_name} ${log.actor.last_name}`.trim() || "Unknown";
}

export default function AdminAuditLogsPage() {
  const dispatch = useAppDispatch();
  const logs = useAppSelector(selectAllAuditLogs);
  const status = useAppSelector(selectAuditLogsStatus);
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [tableFilter, setTableFilter] = useState<TableFilter>("all");

  useFetchOnIdle(
    (state: RootState) => state.auditLogs.status,
    () => fetchAuditLogs(),
    "Failed to fetch audit logs:",
  );

  // Reset on unmount so the next visit always fetches fresh data
  useEffect(() => {
    return () => {
      dispatch(resetAuditLogs());
    };
  }, [dispatch]);

  const filtered = logs.filter((log) => {
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesTable = tableFilter === "all" || log.table_name === tableFilter;
    return matchesAction && matchesTable;
  });

  return (
    <div className="page">
      <div className="inner">
        <div className={styles.pageHeader}>
          <div>
            <h1>Audit Logs</h1>
            <p>{logs.length} entries · last 500</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch(resetAuditLogs())}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Loading…" : "Refresh"}
          </Button>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.filterRow}>
            {ACTION_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActionFilter(f)}
                className={actionFilter === f ? styles.filterBtnActive : styles.filterBtn}
              >
                {f === "all" ? "All actions" : f}
              </button>
            ))}
          </div>

          <div className={styles.filterRow}>
            {TABLE_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setTableFilter(f)}
                className={tableFilter === f ? styles.filterBtnActive : styles.filterBtn}
              >
                {f === "all" ? "All tables" : getTableLabel(f)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.list}>
          {filtered.map((log) => (
            <Card key={log.id}>
              <div className={styles.logRow}>
                <span className={`${styles.badge} ${styles[log.action.toLowerCase() as "insert" | "update" | "delete"]}`}>
                  {log.action}
                </span>

                <div className={styles.logInfo}>
                  <p className={styles.logMain}>
                    {getTableLabel(log.table_name)}
                    {log.record_id && (
                      <span className={styles.recordId}> · {log.record_id.slice(0, 8)}…</span>
                    )}
                  </p>
                  <p className={styles.logMeta}>
                    {getActorName(log)} · {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {filtered.length === 0 && (
            <p className={styles.empty}>No log entries match these filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
