import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Avatar from "@components/shared/Avatar/Avatar";
import Button from "@components/shared/Button/Button";
import Card from "@components/shared/Card/Card";
import ProgressChart from "@components/shared/ProgressChart/ProgressChart";
import type { UserProfile } from "@models/globalTypes";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import type { RootState } from "@store/index";
import { fetchQuestionnaires, selectAllQuestionnaires } from "@store/slices/questionnairesSlice";
import { fetchAllResponses, selectResponsesByUser } from "@store/slices/responsesSlice";
import { fetchAllUsers, selectAllUsers } from "@store/slices/userDirectorySlice";

import DeleteClientModal from "../AdminClientsPage/modals/DeleteClientModal/DeleteClientModal";
import SessionNotesModal from "../AdminClientsPage/modals/SessionNotesModal/SessionNotesModal";
import { exportClientPDF, getScoreAverage } from "../utils/AdminClientsPageUtils";
import styles from "./AdminClientsPageDetailed.module.scss";

export default function AdminClientsPageDetailed() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const allUsers = useAppSelector(selectAllUsers) as UserProfile[];
  const questionnaires = useAppSelector(selectAllQuestionnaires);
  const questionnairesStatus = useAppSelector((state: RootState) => state.questionnaires.status);
  const clientResponses = useAppSelector(selectResponsesByUser(clientId ?? ""));

  const [notesOpen, setNotesOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState("");
  const [isScheduleEditorOpen, setIsScheduleEditorOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAllResponses());
  }, [dispatch]);

  useEffect(() => {
    if (questionnairesStatus === "idle") dispatch(fetchQuestionnaires());
  }, [dispatch, questionnairesStatus]);

  const client = allUsers.find((u) => u.id === clientId);

  const questionnaireOptions = useMemo(
    () => questionnaires.filter((q) => clientResponses.some((r) => r.questionnaire_id === q.id)),
    [questionnaires, clientResponses],
  );

  useEffect(() => {
    if (!selectedQuestionnaireId && questionnaireOptions[0]) {
      setSelectedQuestionnaireId(questionnaireOptions[0].id);
    }
  }, [questionnaireOptions, selectedQuestionnaireId]);

  const selectedQuestionnaire = questionnaires.find((q) => q.id === selectedQuestionnaireId) ?? questionnaireOptions[0];

  const selectedResponses = selectedQuestionnaire
    ? clientResponses.filter((r) => r.questionnaire_id === selectedQuestionnaire.id)
    : [];

  const latestResponse = clientResponses.at(-1);
  const latestQuestionnaire = questionnaires.find((q) => q.id === latestResponse?.questionnaire_id);
  const avgScore = latestResponse ? getScoreAverage(latestResponse, latestQuestionnaire) : null;
  const lastCheckIn = latestResponse
    ? ((latestResponse.submitted_at ?? latestResponse.created_at)?.split("T")[0] ?? "—")
    : "—";

  const handleExport = async () => {
    if (!client) return;
    setExporting(true);
    await exportClientPDF({
      user: client,
      responses: selectedResponses,
      questionnaire: selectedQuestionnaire,
    });
    setExporting(false);
  };

  if (!client) {
    return (
      <div className="page">
        <div className="inner">
          <div className={styles.notFound}>
            <span className={styles.notFoundIcon}>👤</span>
            <h2>Client not found</h2>
            <p>This client may have been removed or the link is incorrect.</p>
            <Button variant="secondary" onClick={() => navigate("/admin/clients")}>
              ← Back to clients
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const clientSince = client.created_at?.split("T")[0];

  return (
    <div className="page">
      <div className="inner">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/clients")}>
          ← Back to clients
        </Button>

        {/* Profile hero */}
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <Avatar name={`${client.first_name} ${client.last_name}`} imageSrc={client.avatar_url ?? ""} size={80} />
            <div>
              <h1 className={styles.heroName}>
                {client.first_name} {client.last_name}
              </h1>
              <p className={styles.heroEmail}>{client.email}</p>
              {clientSince && <p className={styles.heroSince}>Client since {clientSince}</p>}
            </div>
          </div>

          <div className={styles.heroActions}>
            <Button variant="secondary" size="sm" onClick={() => setNotesOpen(true)}>
              Notes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              disabled={exporting || selectedResponses.length === 0}
            >
              {exporting ? "Exporting…" : "Export PDF"}
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <div className={styles.statsRow}>
          <div className={styles.statBlock}>
            <p className={styles.statValue}>
              {avgScore ?? "—"}
              {avgScore && <span>/10</span>}
            </p>
            <p className={styles.statLabel}>Latest score</p>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statBlock}>
            <p className={styles.statValue}>{clientResponses.length}</p>
            <p className={styles.statLabel}>Check-ins</p>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statBlock}>
            <p className={styles.statValue}>{lastCheckIn}</p>
            <p className={styles.statLabel}>Last check-in</p>
          </div>
        </div>

        {/* Progress chart — ProgressChart renders its own Card, so no outer wrapper */}
        <div className={styles.progressSection}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Progress</h2>
            {questionnaireOptions.length > 1 && (
              <div className={styles.progressControls}>
                <label htmlFor="q-select">Questionnaire</label>
                <select
                  id="q-select"
                  value={selectedQuestionnaire?.id ?? ""}
                  onChange={(e) => setSelectedQuestionnaireId(e.target.value)}
                >
                  {questionnaireOptions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {selectedQuestionnaire ? (
            <ProgressChart
              responses={selectedResponses}
              questions={
                (
                  selectedQuestionnaire as typeof selectedQuestionnaire & {
                    questions?: [];
                  }
                ).questions ?? []
              }
              title={`${client.first_name}'s Progress`}
            />
          ) : (
            <Card>
              <p className={styles.emptyState}>No check-in data yet.</p>
            </Card>
          )}
        </div>

        {/* Sessions placeholder */}
        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>Sessions</h2>
          <p className={styles.placeholder}>Session scheduling coming soon.</p>
        </Card>

        {/* Danger zone */}
        <div className={styles.dangerZone}>
          <div>
            <p className={styles.dangerTitle}>Remove client</p>
            <p className={styles.dangerDesc}>Permanently deletes this client account and all associated data.</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            Delete client
          </Button>
        </div>
      </div>

      {notesOpen && <SessionNotesModal user={client} onClose={() => setNotesOpen(false)} />}

      {deleteOpen && (
        <DeleteClientModal
          id={client.id}
          onClose={() => {
            setDeleteOpen(false);
            navigate("/admin/clients");
          }}
          modalTitle="Delete client"
          bodyText={
            <>
              Are you sure you want to delete{" "}
              <strong>
                {client.first_name} {client.last_name}
              </strong>
              ? This cannot be undone.
            </>
          }
        />
      )}
    </div>
  );
}
