import { useEffect, useMemo, useState } from "react";

import Avatar from "@components/shared/Avatar/Avatar";
import Button from "@components/shared/Button/Button";
import Card from "@components/shared/Card/Card";
import ProgressChart from "@components/shared/ProgressChart/ProgressChart";
import type { Questionnaire, Response, UserProfile } from "@models/globalTypes";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import type { RootState } from "@store/index";
import { fetchQuestionnaires, selectAllQuestionnaires } from "@store/slices/questionnairesSlice";
import { fetchAllResponses, selectResponsesByUser } from "@store/slices/responsesSlice";
import { fetchAllUsers, selectAllUsers } from "@store/slices/userDirectorySlice";

import AccessTokenModal from "./modals/AcessTokenModal/AcessTokenModal";
import DeleteClientModal from "./modals/DeleteClientModal/DeleteClientModal";
import { exportClientPDF, getScoreAverage } from "./utils/AdminClientsPageUtils";

import styles from "./AdminClientsPage.module.scss";

const getQuestionnaireForResponse = (response: Response | undefined, questionnaires: Questionnaire[]) => {
  if (!response) return undefined;
  return questionnaires.find((questionnaire) => questionnaire.id === response.questionnaire_id);
};

function ClientRow({ user }: { user: UserProfile }) {
  const allResponses = useAppSelector(selectResponsesByUser(user.id));
  const questionnaires = useAppSelector(selectAllQuestionnaires);

  const questionnaireOptions = useMemo(
    () =>
      questionnaires.filter((questionnaire) =>
        allResponses.some((response) => response.questionnaire_id === questionnaire.id),
      ),
    [questionnaires, allResponses],
  );

  const latestResponse = allResponses[allResponses.length - 1];
  const latestQuestionnaire = getQuestionnaireForResponse(latestResponse, questionnaires);

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
    questionnaireOptions.find((questionnaire) => questionnaire.id === selectedQuestionnaireId) ??
    questionnaireOptions[0];

  const selectedResponses = selectedQuestionnaire
    ? allResponses.filter((response) => response.questionnaire_id === selectedQuestionnaire.id)
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
        <Avatar initials={`${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`} color="teal" size={40} />

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
              <label htmlFor={`questionnaire-${user.id}`}>Questionnaire</label>
              <select
                id={`questionnaire-${user.id}`}
                value={selectedQuestionnaire?.id ?? ""}
                onChange={(event) => setSelectedQuestionnaireId(event.target.value)}
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
  const dispatch = useAppDispatch();
  const allUsers = useAppSelector(selectAllUsers) as UserProfile[];
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [search, setSearch] = useState("");

  const userDirectoryStatus = useAppSelector((state: RootState) => state.userDirectory.status);
  const questionnairesStatus = useAppSelector((state: RootState) => state.questionnaires.status);
  const responsesStatus = useAppSelector((state: RootState) => state.responses.status);

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
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Clients</h1>
            <p>
              {allClients.length} active {allClients.length === 1 ? "client" : "clients"}
            </p>
          </div>

          <Button onClick={() => setShowTokenModal(true)}>Create access token</Button>
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

      {showTokenModal && <AccessTokenModal onClose={() => setShowTokenModal(false)} />}
    </div>
  );
}
