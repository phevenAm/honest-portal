import { useEffect, useMemo, useState } from "react";

import Avatar from "@components/shared/Avatar/Avatar";
import Button from "@components/shared/Button/Button";
import Card from "@components/shared/Card/Card";
import ProgressChart from "@components/shared/ProgressChart/ProgressChart";
import SplitButton, { SplitButtonProps } from "@components/shared/SplitButton/SplitButton";
import { supabase } from "@lib/supabase";
import type { Questionnaire, Response, UserProfile } from "@models/globalTypes";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import type { RootState } from "@store/index";
import { fetchQuestionnaires, selectAllQuestionnaires } from "@store/slices/questionnairesSlice";
import { fetchAllResponses, selectResponsesByUser } from "@store/slices/responsesSlice";
import { fetchAllUsers, selectAllUsers } from "@store/slices/userDirectorySlice";

import AccessTokenModal from "./modals/AccessTokenModal/AccessTokenModal";
import CreateClientProfileModal from "./modals/CreateClientProfileModal/CreateClientProfileModal";
import DeleteClientModal from "./modals/DeleteClientModal/DeleteClientModal";
import ManageTokensModal from "./modals/ManageTokensModal/ManageTokensModal";
import SessionNotesModal from "./modals/SessionNotesModal/SessionNotesModal";
import { exportClientPDF, getScoreAverage } from "./utils/AdminClientsPageUtils";

import styles from "./AdminClientsPage.module.scss";

export type ClientStub = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  linked_user_id: string | null;
  created_at: string;
};

const getQuestionnaireForResponse = (response: Response | undefined, questionnaires: Questionnaire[]) => {
  if (!response) return undefined;
  return questionnaires.find((questionnaire) => questionnaire.id === response.questionnaire_id);
};

// ── Client row (real users) ────────────────────────────────

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
  const lastCheckIn = (latestResponse?.submitted_at ?? latestResponse?.created_at)?.split("T")[0] ?? "–";

  const [expanded, setExpanded] = useState(false);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState("");
  const [exporting, setExporting] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isNotesOpen, setNotesOpen] = useState(false);

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
        <Avatar name={user?.display_name || ""} color="teal" size={40} />

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

        <div className={styles.statBlock}>
          <p className={styles.statValueDate}>{lastCheckIn}</p>
          <p className={styles.statLabel}>Last check-in</p>
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

          <Button variant="ghost" size="sm" onClick={() => setNotesOpen(true)}>
            Notes
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
              questions={selectedQuestionnaire.questions ?? []}
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

      {isNotesOpen && <SessionNotesModal user={user} onClose={() => setNotesOpen(false)} />}
    </>
  );
}

// ── Stub row (offline client profiles) ────────────────────

function StubRow({
  stub,
  allUsers,
  linkedUserIds,
  onUpdated,
  onDeleted,
}: {
  stub: ClientStub;
  allUsers: UserProfile[];
  linkedUserIds: Set<string>;
  onUpdated: (stub: ClientStub) => void;
  onDeleted: (id: string) => void;
}) {
  const [isNotesOpen, setNotesOpen] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const linkedUser = stub.linked_user_id ? allUsers.find((u) => u.id === stub.linked_user_id) : null;
  const availableToLink = allUsers.filter((u) => u.role !== "admin" && !linkedUserIds.has(u.id));

  const handleLink = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("client_stubs")
      .update({ linked_user_id: selectedUserId })
      .eq("id", stub.id)
      .select("id, first_name, last_name, email, linked_user_id, created_at")
      .single();
    if (!error && data) {
      onUpdated(data);
      setLinkMode(false);
      setSelectedUserId("");
    }
    setSaving(false);
  };

  const handleUnlink = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from("client_stubs")
      .update({ linked_user_id: null })
      .eq("id", stub.id)
      .select("id, first_name, last_name, email, linked_user_id, created_at")
      .single();
    if (!error && data) onUpdated(data);
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("client_stubs").delete().eq("id", stub.id);
    if (!error) onDeleted(stub.id);
    setDeleting(false);
  };

  return (
    <>
      <div className={styles.stubRow}>
        <Avatar name={`${stub.first_name} ${stub.last_name}`} color="stone" size={40} />

        <div className={styles.clientMeta}>
          <p className={styles.clientName}>
            {stub.first_name} {stub.last_name}
          </p>
          <p className={styles.clientEmail}>{stub.email ?? "–"}</p>
        </div>

        {stub.linked_user_id ? (
          <span className={styles.badgeLinked}>
            {linkedUser ? `${linkedUser.first_name} ${linkedUser.last_name}` : "Linked"}
          </span>
        ) : (
          <span className={styles.badgeUnlinked}>No account</span>
        )}

        <div className={styles.rowActions}>
          <Button variant="ghost" size="sm" onClick={() => setNotesOpen(true)}>
            Notes
          </Button>

          {stub.linked_user_id ? (
            <Button variant="ghost" size="sm" onClick={handleUnlink} disabled={saving}>
              {saving ? "…" : "Unlink"}
            </Button>
          ) : linkMode ? (
            <>
              <select
                className={styles.linkSelect}
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select client…</option>
                {availableToLink.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name} {u.last_name}
                  </option>
                ))}
              </select>
              <Button size="sm" onClick={handleLink} disabled={!selectedUserId || saving}>
                {saving ? "…" : "Confirm"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLinkMode(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setLinkMode(true)}>
              Link to client
            </Button>
          )}

          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            aria-label={`Remove profile for ${stub.first_name} ${stub.last_name}`}
          >
            {deleting ? "…" : "Remove"}
          </Button>
        </div>
      </div>

      {isNotesOpen && (
        <SessionNotesModal
          stubId={stub.id}
          stubName={`${stub.first_name} ${stub.last_name}`}
          onClose={() => setNotesOpen(false)}
        />
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function AdminClientsPage() {
  const dispatch = useAppDispatch();
  const allUsers = useAppSelector(selectAllUsers) as UserProfile[];
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [manageTokensModal, setManageTokensModal] = useState(false);
  const [createProfileModal, setCreateProfileModal] = useState(false);
  const [search, setSearch] = useState("");
  const [stubs, setStubs] = useState<ClientStub[]>([]);

  const questionnairesStatus = useAppSelector((state: RootState) => state.questionnaires.status);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (questionnairesStatus === "idle") dispatch(fetchQuestionnaires());
  }, [dispatch, questionnairesStatus]);

  useEffect(() => {
    dispatch(fetchAllResponses());
  }, [dispatch]);

  useEffect(() => {
    supabase
      .from("client_stubs")
      .select("id, first_name, last_name, email, linked_user_id, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setStubs(data ?? []));
  }, []);

  const allClients = allUsers.filter((user) => user.role !== "admin");

  const filtered = allClients.filter(
    (user) =>
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const linkedUserIds = useMemo(() => new Set(stubs.map((s) => s.linked_user_id).filter(Boolean) as string[]), [stubs]);

  const splitButtonObj: SplitButtonProps = {
    primaryLabel: "Create access token",
    primaryAction: () => setShowTokenModal(true),
    options: [
      { label: "Manage tokens", onClick: () => setManageTokensModal(true) },
      { label: "Create client profile", onClick: () => setCreateProfileModal(true) },
    ],
    secondaryLabel: "View more options",
  };

  return (
    <div className="page">
      <div className="inner">
        <div className={styles.pageHeader}>
          <div>
            <h1>Clients</h1>
            <p>
              {allClients.length} active {allClients.length === 1 ? "client" : "clients"}
            </p>
          </div>

          <SplitButton {...splitButtonObj} />
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

        {stubs.length > 0 && (
          <div className={styles.stubsSection}>
            <div className={styles.stubsSectionHeader}>
              <h2>Client profiles</h2>
              <p>Offline profiles — link to a real account once the client signs up.</p>
            </div>
            <Card>
              {stubs.map((stub) => (
                <StubRow
                  key={stub.id}
                  stub={stub}
                  allUsers={allUsers}
                  linkedUserIds={linkedUserIds}
                  onUpdated={(updated) => setStubs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))}
                  onDeleted={(id) => setStubs((prev) => prev.filter((s) => s.id !== id))}
                />
              ))}
            </Card>
          </div>
        )}
      </div>

      {showTokenModal && <AccessTokenModal onClose={() => setShowTokenModal(false)} />}
      {manageTokensModal && <ManageTokensModal onClose={() => setManageTokensModal(false)} />}
      {createProfileModal && (
        <CreateClientProfileModal
          onClose={() => setCreateProfileModal(false)}
          onCreated={(stub) => setStubs((prev) => [stub, ...prev])}
        />
      )}
    </div>
  );
}
