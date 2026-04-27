import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addUser,
  selectAllUsers,
} from "../../../store/slices/userDirectorySlice";
import { selectUserQuestionnaireResponses } from "../../../store/slices/responsesSlice";
import Card from "../../../components/shared/Card/Card";
import Avatar from "../../../components/shared/Avatar/Avatar";
import Button from "../../../components/shared/Button/Button";
import ProgressChart from "../../../components/shared/ProgressChart/ProgressChart";
import styles from "./AdminClientsPage.module.scss";
import DeleteClientModal from "./modals/DeleteClientModal/DeleteClientModal";

// ── PDF Export ─────────────────────────────────────────────
const exportClientPDF = async (user: any, responses: any[]) => {
  const jsPDF = (await import("jspdf")).default;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210,
    margin = 20;

  doc.setFillColor(31, 73, 64); // teal-800
  doc.rect(0, 0, pageW, 40, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("WithMe", margin, 18);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Client Progress Report", margin, 28);

  doc.setTextColor(45, 41, 38);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`${user.first_name} ${user.last_name}`, margin, 56);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated ${new Date().toLocaleDateString()}`, margin, 64);

  if (responses.length > 0) {
    const avgScores = responses.map((r) =>
      parseFloat(
        (
          Object.values(r.scores as Record<string, number>).reduce(
            (a, b) => a + b,
            0,
          ) / 4
        ).toFixed(1),
      ),
    );
    const overall = (
      avgScores.reduce((a, b) => a + b, 0) / avgScores.length
    ).toFixed(1);
    const latest = avgScores[avgScores.length - 1];
    const change = (latest - avgScores[0]).toFixed(1);
    const colW = (pageW - margin * 2 - 8) / 3;

    [
      [`${overall}/10`, "Overall avg"],
      [`${latest}/10`, "Latest"],
      [`${parseFloat(change) >= 0 ? "+" : ""}${change}`, "Change"],
    ].forEach(([val, label], i) => {
      const x = margin + i * (colW + 4);
      doc.setFillColor(243, 241, 238);
      doc.roundedRect(x, 74, colW, 22, 4, 4, "F");
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(45, 41, 38);
      doc.text(val, x + 8, 83);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(130, 130, 130);
      doc.text(label, x + 8, 90);
    });
  }

  doc.setFontSize(8);
  doc.setTextColor(170, 170, 170);
  doc.text("Confidential — WithMe Client Report", margin, 285);
  doc.save(`${user.first_name}_${user.last_name}_progress.pdf`);
};
// ── Delete Client Modal ───────────────────────────────────────

// ── Add Client Modal ───────────────────────────────────────
function AddClientModal({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: "", email: "" });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Both fields are required");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    dispatch(addUser(form));
    onClose();
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className={styles.modal}>
        <h3 className={styles.modalTitle}>Add new client</h3>
        {error && <p className={styles.modalError}>{error}</p>}
        <div className={styles.formRow}>
          {(["name", "email"] as const).map((field) => (
            <div key={field} className={styles.field}>
              <label htmlFor={`add-${field}`}>{field}</label>
              <input
                id={`add-${field}`}
                type={field === "email" ? "email" : "text"}
                value={form[field]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [field]: e.target.value }))
                }
                placeholder={
                  field === "email" ? "client@email.com" : "Full name"
                }
              />
            </div>
          ))}
        </div>
        <div className={styles.modalActions}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add client</Button>
        </div>
      </Card>
    </div>
  );
}

// ── Client Row ─────────────────────────────────────────────
function ClientRow({ user }: { user: any }) {
  const responses = useSelector(
    selectUserQuestionnaireResponses(user.id, "q-1"),
  );
  const [expanded, setExpanded] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    await exportClientPDF(user, responses);
    setExporting(false);
  };

  const latest = responses[responses.length - 1];
  const avgScore = latest
    ? (
        Object.values(latest.scores as Record<string, number>).reduce(
          (a, b) => a + b,
          0,
        ) / 4
      ).toFixed(1)
    : null;

  return (
    <>
      <div className={styles.clientRow}>
        <Avatar
          initials={`${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`}
          color="teal"
          size={40}
        />
        <div className={styles.clientMeta}>
          <p className={styles.clientName}>
            {user.first_name} {user.last_name}
          </p>
          <p className={styles.clientEmail}>{user.email}</p>
        </div>
        <div className={styles.statBlock}>
          <p className={styles.statValue}>
            {avgScore ?? "–"}
            <span>/10</span>
          </p>
          <p className={styles.statLabel}>Latest</p>
        </div>
        <div className={styles.statBlock}>
          <p className={styles.statValue}>{responses.length}</p>
          <p className={styles.statLabel}>Check-ins</p>
        </div>
        <div className={styles.rowActions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Hide" : "View"} data
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "…" : "Export PDF"}
          </Button>
          <Button
            variant="danger"
            size="sm"
            aria-label={`Remove ${user.first_name} ${user.last_name}`}
            onClick={() => setDeleteModalOpen(true)}
          >
            Remove
          </Button>
        </div>
      </div>
      {expanded && (
        <div className={styles.expandedChart}>
          <ProgressChart
            responses={responses}
            title={`${user.first_name}'s Progress`}
          />
        </div>
      )}

{isDeleteModalOpen && (
  <DeleteClientModal
    id={user.id}
    onClose={() => setDeleteModalOpen(false)}
    modalTitle="Delete user"
    bodyText={
      <>
        Are you sure you want to delete{" "}
        <strong>
          {user.first_name} {user.last_name}
        </strong>
        ?
      </>
    }
  />
)}
    </>
  );
}

// ── Main ───────────────────────────────────────────────────
export default function AdminClientsPage() {
  const allClients = useSelector(selectAllUsers);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = allClients.filter(
    (u) =>
      `${u.first_name} ${u.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Clients</h1>
              <p>
                {allClients.length} active{" "}
                {allClients.length === 1 ? "client" : "clients"}
              </p>
            </div>
            <Button onClick={() => setShowAdd(true)}>Add client</Button>
          </div>

          <div className={styles.searchWrap}>
            <input
              type="search"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search clients"
              className={styles.searchInput}
            />
          </div>

          <Card>
            {filtered.length === 0 ? (
              <p className={styles.empty}>
                {allClients.length === 0
                  ? "No clients yet. Add your first client above."
                  : "No clients match your search."}
              </p>
            ) : (
              filtered.map((u) => <ClientRow key={u.id} user={u} />)
            )}
          </Card>
        </div>

        {showAdd && <AddClientModal onClose={() => setShowAdd(false)} />}
      </div>
    </>
  );
}
