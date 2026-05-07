import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsers,
  selectAllUsers,
} from "../../../store/slices/userDirectorySlice";
import {
  fetchAllResponses,
  selectResponsesByUser,
} from "../../../store/slices/responsesSlice";
import {
  fetchQuestionnaires,
  selectAllQuestionnaires,
} from "../../../store/slices/questionnairesSlice";
import { supabase } from "../../../lib/supabase";
import Card from "../../../components/shared/Card/Card";
import Avatar from "../../../components/shared/Avatar/Avatar";
import Button from "../../../components/shared/Button/Button";
import ProgressChart from "../../../components/shared/ProgressChart/ProgressChart";
import styles from "./AdminClientsPage.module.scss";
import DeleteClientModal from "./modals/DeleteClientModal/DeleteClientModal";
import type {
  AppDispatch,
  RootState,
} from "../../../store/index";
import type {
  Question,
  Questionnaire,
  Response,
  UserProfile,
} from "../../../models/globalTypes";

import AccessTokenModal from "./modals/AcessTokenModal/AcessTokenModal"

const generateAccessToken = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const groups = Array.from({ length: 3 }, () =>
    Array.from({ length: 4 }, () =>
      alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join(""),
  );

  return groups.join("-");
};

const getResponseDate = (response: Response) =>
  response.submitted_at ?? response.created_at ?? "";

const getScoreAverage = (
  response: Response | undefined,
  questionnaire: Questionnaire | undefined,
) => {
  if (!response || !questionnaire) return null;

  const scaleQuestions = questionnaire.questions?.filter(
    (question) => question.type === "scale",
  );

  if (!scaleQuestions?.length) return null;

  const total = scaleQuestions.reduce((sum, question) => {
    const raw = (response.scores as Record<string, number | string>)[question.id];
    const score = Number(raw ?? 0);
    return sum + (Number.isFinite(score) ? score : 0);
  }, 0);

  return (total / scaleQuestions.length).toFixed(1);
};

const getQuestionnaireForResponse = (
  response: Response | undefined,
  questionnaires: Questionnaire[],
) => {
  if (!response) return undefined;
  return questionnaires.find(
    (questionnaire) => questionnaire.id === response.questionnaire_id,
  );
};

// ── PDF Export ─────────────────────────────────────────────
const exportClientPDF = async ({
  user,
  responses,
  questionnaire,
}: {
  user: UserProfile;
  responses: Response[];
  questionnaire?: Questionnaire;
}) => {
  const jsPDF = (await import("jspdf")).default;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 20;

  doc.setFillColor(31, 73, 64);
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

  if (questionnaire) {
    doc.text(`Questionnaire: ${questionnaire.title}`, margin, 70);
  }

  if (responses.length > 0 && questionnaire) {
    const averages = responses
      .map((response) => Number(getScoreAverage(response, questionnaire)))
      .filter((score) => Number.isFinite(score));

    if (averages.length) {
      const overall = (
        averages.reduce((total, score) => total + score, 0) / averages.length
      ).toFixed(1);
      const latest = averages[averages.length - 1];
      const change = (latest - averages[0]).toFixed(1);
      const colW = (pageW - margin * 2 - 8) / 3;

      [
        [`${overall}/10`, "Overall avg"],
        [`${latest}/10`, "Latest"],
        [`${parseFloat(change) >= 0 ? "+" : ""}${change}`, "Change"],
      ].forEach(([value, label], index) => {
        const x = margin + index * (colW + 4);
        doc.setFillColor(243, 241, 238);
        doc.roundedRect(x, 78, colW, 22, 4, 4, "F");
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(45, 41, 38);
        doc.text(value, x + 8, 87);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(130, 130, 130);
        doc.text(label, x + 8, 94);
      });
    }
  }

  doc.setFontSize(8);
  doc.setTextColor(170, 170, 170);
  doc.text("Confidential — WithMe Client Report", margin, 285);
  doc.save(`${user.first_name}_${user.last_name}_progress.pdf`);
};



function ClientRow({ user }: { user: UserProfile }) {
  const allResponses = useSelector(selectResponsesByUser(user.id));
  const questionnaires = useSelector(selectAllQuestionnaires);

  const questionnaireOptions = useMemo(
    () =>
      questionnaires.filter((questionnaire) =>
        allResponses.some(
          (response) => response.questionnaire_id === questionnaire.id,
        ),
      ),
    [questionnaires, allResponses],
  );

  const latestResponse = allResponses[allResponses.length - 1];
  const latestQuestionnaire = getQuestionnaireForResponse(
    latestResponse,
    questionnaires,
  );

  const [expanded, setExpanded] = useState(false);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState("");
  const [exporting, setExporting] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!selectedQuestionnaireId && questionnaireOptions[0]?.id) {
      setSelectedQuestionnaireId(questionnaireOptions[0].id);
    }
  }, [questionnaireOptions, selectedQuestionnaireId]);

  const selectedQuestionnaire =
    questionnaireOptions.find(
      (questionnaire) => questionnaire.id === selectedQuestionnaireId,
    ) ?? questionnaireOptions[0];

  const selectedResponses = selectedQuestionnaire
    ? allResponses.filter(
        (response) => response.questionnaire_id === selectedQuestionnaire.id,
      )
    : [];

  const avgScore = getScoreAverage(latestResponse, latestQuestionnaire);

  const handleExport = async () => {
    setExporting(true);
    await exportClientPDF({
      user,
      responses: selectedResponses,
      questionnaire: selectedQuestionnaire,
    });
    setExporting(false);
  };

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
          <p className={styles.statValue}>{allResponses.length}</p>
          <p className={styles.statLabel}>Check-ins</p>
        </div>

        <div className={styles.rowActions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            disabled={allResponses.length === 0}
          >
            {expanded ? "Hide" : "View"} progress
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            disabled={exporting || selectedResponses.length === 0}
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
          {questionnaireOptions.length > 1 && (
            <div className={styles.progressControls}>
              <label htmlFor={`questionnaire-${user.id}`}>
                Questionnaire
              </label>
              <select
                id={`questionnaire-${user.id}`}
                value={selectedQuestionnaire?.id ?? ""}
                onChange={(event) =>
                  setSelectedQuestionnaireId(event.target.value)
                }
              >
                {questionnaireOptions.map((questionnaire) => (
                  <option key={questionnaire.id} value={questionnaire.id}>
                    {questionnaire.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedQuestionnaire ? (
            <ProgressChart
              responses={selectedResponses}
              questionnaire={selectedQuestionnaire}
              title={`${user.first_name}'s Progress`}
            />
          ) : (
            <p className={styles.empty}>No questionnaire responses yet.</p>
          )}
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

export default function AdminClientsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const allUsers = useSelector(selectAllUsers) as UserProfile[];
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [search, setSearch] = useState("");

  const userDirectoryStatus = useSelector(
    (state: RootState) => state.userDirectory.status,
  );
  const questionnairesStatus = useSelector(
    (state: RootState) => state.questionnaires.status,
  );
  const responsesStatus = useSelector((state: RootState) => state.responses.status);

  useEffect(() => {
    if (userDirectoryStatus === "idle") {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, userDirectoryStatus]);

  useEffect(() => {
    if (questionnairesStatus === "idle") {
      dispatch(fetchQuestionnaires());
    }
  }, [dispatch, questionnairesStatus]);

  useEffect(() => {
    if (responsesStatus === "idle") {
      dispatch(fetchAllResponses());
    }
  }, [dispatch, responsesStatus]);

  const allClients = allUsers.filter((user) => user.role !== "admin");

  const filtered = allClients.filter(
    (user) =>
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()),
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

            <Button onClick={() => setShowTokenModal(true)}>
              Create access token
            </Button>
          </div>

          <div className={styles.searchWrap}>
            <input
              type="search"
              placeholder="Search by name or email…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search clients"
              className={styles.searchInput}
            />
          </div>

          <Card>
            {filtered.length === 0 ? (
              <p className={styles.empty}>
                {allClients.length === 0
                  ? "No clients yet. Create an access token and ask a client to sign up."
                  : "No clients match your search."}
              </p>
            ) : (
              filtered.map((user) => <ClientRow key={user.id} user={user} />)
            )}
          </Card>
        </div>

        {showTokenModal && (
          <AccessTokenModal onClose={() => setShowTokenModal(false)} />
        )}
      </div>
    </>
  );
}
