/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import dayjs from "dayjs";

import { Avatar, Button, Card, ToggleButtonTabs, ProgressChart, Search } from "@components/shared/index";

import CreateSessionModal from "@components/shared/SessionCard/CreateSessionModal/CreateSessionModal";
import { SessionCard } from "@components/shared/SessionCard/SessionCard";
import type { Session, UserProfile } from "@models/globalTypes";
import { useAppDispatch, useAppSelector, useFetchOnIdle } from "@store/hooks";
import type { RootState } from "@store/index";
import { fetchQuestionnaires, selectAllQuestionnaires } from "@store/slices/questionnairesSlice";
import { fetchAllResponses, selectResponsesByUser } from "@store/slices/responsesSlice";
import { fetchAllUsers, selectAllUsers } from "@store/slices/userDirectorySlice";

import { useAuth } from "@/context/AuthContext";
import { fetchSessionsByClientId } from "@/store/slices/sessionsSlice";
import DeleteClientModal from "../AdminClientsPage/modals/DeleteClientModal/DeleteClientModal";
import SessionNotesModal from "../AdminClientsPage/modals/SessionNotesModal/SessionNotesModal";
import { exportClientPDF, getScoreAverage } from "../utils/AdminClientsPageUtils";

import styles from "./AdminClientsPageDetailed.module.scss";
import { ToggleButtonTabsTypes } from "@/components/shared/ToggleButtonTabs/ToggleButtonTabs";

export default function AdminClientsPageDetailed() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isDemo } = useAuth();

  const allUsers = useAppSelector(selectAllUsers) as UserProfile[];
  const questionnaires = useAppSelector(selectAllQuestionnaires);
  const questionnairesStatus = useAppSelector((state: RootState) => state.questionnaires.status);
  const clientResponses = useAppSelector(selectResponsesByUser(clientId ?? ""));

  const [notesOpen, setNotesOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState("");
  const [isScheduleEditorOpen, setIsScheduleEditorOpen] = useState(false);
  const [isManageSessionsModal, setIsManageSessionsModal] = useState(false);
  const [sessionPageNumber, setSessionPageNumber] = useState<null | number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [sessionsDateTab, setSessopmsDateTab] = useState<"upcoming" | "past">("upcoming");

  useFetchOnIdle(
    (state: RootState) => state.sessions.status,
    () => fetchSessionsByClientId(clientId!),
    "Failed to fetch questionnaires:",
  );

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

  //! is there a selector for this? nah, i shuld just fetch sessions by id. i have a THUNK for that
  const clientSessions = useAppSelector((state) => state.sessions.sessions);

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
    ? dayjs(latestResponse.submitted_at ?? latestResponse.created_at).format("D MMM YYYY")
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

  const sessionsGroupByType = useMemo((): Session[] => {
    const now = new Date();
    return clientSessions.filter((session) => {
      const scheduledAt = new Date(session.scheduled_at);
      return sessionsDateTab === "upcoming" ? scheduledAt >= now : scheduledAt < now;
    });
  }, [sessionsDateTab, clientSessions]);

  const searchResults = useMemo(
    (): Session[] =>
      searchTerm.length > 0
        ? sessionsGroupByType.filter((s) => {
            const dateStr =
              `${dayjs(s.scheduled_at).format("dddd D MMMM YYYY")} ${dayjs(s.scheduled_at).format("D MMM YYYY")}`.toLowerCase();
            return (
              (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
              dateStr.includes(searchTerm.toLowerCase())
            );
          })
        : sessionsGroupByType,
    [sessionsGroupByType, searchTerm],
  );
  const paginateSessions = (array: Session[], currentPage: number, pageSize: number): Session[] => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return array.slice(startIndex, endIndex);
  };

  const maxPageSize = 4;

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

  const tabsObj: ToggleButtonTabsTypes = {
    leftButtonTitle: "Past",
    leftButtonAction: () => {
      setSessionPageNumber(1);
      setSessopmsDateTab("past");
    },
    rightButtonTitle: "Upcoming",
    rightButtonAction: () => {
      setSessionPageNumber(1);
      setSessopmsDateTab("upcoming");
    },
  };

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
              {clientSince && (
                <p className={styles.heroSince}>Client since {dayjs(clientSince).format("DD/MM/YYYY")}</p>
              )}
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

        <Card className={[styles.section, styles.session].join(" ")}>
          <div className={styles.sessionHeading}>
            <h2 className={styles.sectionTitle}>Sessions</h2>
            <Button size="sm" onClick={() => setIsScheduleEditorOpen(true)}>
              + New session
            </Button>
          </div>

          <div className={styles.mainActions}>
            <ToggleButtonTabs {...tabsObj} />

            <div className="seachContainer">
              <Search
                handleChange={(e) => setSearchTerm(e)}
                placeholder="Find a session..."
                label="Search for a session"
                id="session"
              />
            </div>
          </div>

          <div className={styles.sessionList}>
            {(searchResults.length === 0 && <p className={styles.sessionEmpty}>No sessions found!</p>) ||
              (clientSessions.length === 0 ? (
                <p className={styles.sessionEmpty}>No sessions yet.</p>
              ) : (
                paginateSessions(searchResults, sessionPageNumber ?? 1, maxPageSize).map((s) => (
                  <SessionCard key={s.id} session={s} isDemo={isDemo} isAdmin />
                ))
              ))}

            {searchResults.length > 4 && (
              <div className={styles.sessionPagination}>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSessionPageNumber((sessionPageNumber ?? 1) - 1)}
                  disabled={(sessionPageNumber ?? 1) <= 1}
                >
                  ← Prev
                </Button>
                {Math.ceil(searchResults.length / maxPageSize) > 5 && (
                  <span className={styles.pageInput}>
                    <input
                      type="number"
                      min={1}
                      max={Math.ceil(searchResults.length / maxPageSize)}
                      value={sessionPageNumber ?? 1}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const max = Math.ceil(searchResults.length / maxPageSize);
                        setSessionPageNumber(Math.min(Math.max(val || 1, 1), max));
                      }}
                    />
                    <span className={styles.pageTotal}>of {Math.ceil(searchResults.length / maxPageSize)}</span>
                  </span>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSessionPageNumber((sessionPageNumber ?? 1) + 1)}
                  disabled={(sessionPageNumber ?? 1) >= Math.ceil(searchResults.length / maxPageSize)}
                >
                  Next →
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Danger zone */}
        <div className={styles.dangerZone}>
          <div>
            <p className={styles.dangerTitle}>Remove client</p>
            <p className={styles.dangerDesc}>Permanently deletes this client account and all associated data.</p>
          </div>
          <Button variant="danger" size="sm" disabled={isDemo} onClick={() => setDeleteOpen(true)}>
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

      {isManageSessionsModal && <div>Manage sessions modal</div>}
      {isScheduleEditorOpen && (
        <CreateSessionModal
          clientName={client.display_name || client.first_name}
          clientId={clientId!}
          onClose={() => setIsScheduleEditorOpen(false)}
        />
      )}
    </div>
  );
}
