import { useEffect, useState } from "react";

import Button from "@components/shared/Button/Button";
import Card from "@components/shared/Card/Card";
import { useAppDispatch, useAppSelector, useFetchOnIdle } from "@store/hooks";
import type { RootState } from "@store/index";
import {
  assignQuestionnaire,
  fetchAssignmentsByQuestionnaire,
  selectAssignmentsByQuestionnaire,
  unassignQuestionnaireByIds,
} from "@store/slices/questionnaireAssignmentsSlice";
import {
  createQuestionnaire,
  deleteQuestionnaire,
  fetchQuestionnaires,
  pauseQuestionnaire,
  selectAllQuestionnaires,
  updateQuestionnaire,
} from "@store/slices/questionnairesSlice";
import { fetchAllUsers, selectClientUsers } from "@store/slices/userDirectorySlice";

import type { Questionnaire, UserProfile } from "@/models/globalTypes";

import styles from "./AdminQuestionnairesPage.module.scss";

const QUESTION_TYPES = ["scale", "text"];

// ─── Question builder form (shared by create + edit) ───────

function QuestionnaireBuilder({
  initial,
  onSave,
  onClose,
}: {
  initial?: Questionnaire | null;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDesc] = useState(initial?.description ?? "");
  const [frequency, setFrequency] = useState(initial?.frequency ?? "weekly");
  const [questions, setQuestions] = useState(
    initial?.questions?.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      min: q.min_value ?? 1,
      max: q.max_value ?? 10,
      minLabel: q.min_label ?? "",
      maxLabel: q.max_label ?? "",
      orderIndex: q.order_index,
      is_required: q.is_required,
    })) ?? [
      {
        id: `nq-${Date.now()}`,
        text: "",
        type: "scale",
        min: 1,
        max: 10,
        minLabel: "",
        maxLabel: "",
        orderIndex: 1,
        is_required: true,
      },
    ],
  );

  const addQuestion = () =>
    setQuestions((qs) => [
      ...qs,
      {
        id: `nq-${Date.now()}`,
        text: "",
        type: "scale",
        min: 1,
        max: 10,
        minLabel: "",
        maxLabel: "",
        orderIndex: qs.length + 1,
        is_required: true,
      },
    ]);

  const removeQuestion = (id: string) => setQuestions((qs) => qs.filter((q) => q.id !== id));

  const updateQuestion = (id: string, field: string, value: string) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, [field]: value } : q)));

  const handleSave = () => {
    if (!title.trim() || questions.some((q) => !q.text.trim())) {
      alert("Please fill in a title and all question texts");
      return;
    }
    onSave({ title, description, frequency, questions });
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <Card className={styles.modal}>
        <h3 className={styles.modalTitle}>{isEdit ? "Edit questionnaire" : "New questionnaire"}</h3>

        <div className={styles.metaGrid}>
          <div className={`${styles.formField} ${styles.fullCol}`}>
            <label htmlFor="q-title">Title *</label>
            <input
              id="q-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly Wellbeing Check-in"
            />
          </div>
          <div className={`${styles.formField} ${styles.fullCol}`}>
            <label htmlFor="q-desc">Description</label>
            <input
              id="q-desc"
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Brief description for your client"
            />
          </div>
          <div className={styles.formField}>
            <label htmlFor="q-freq">Frequency</label>
            <select id="q-freq" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
            </select>
          </div>
        </div>

        <div className={styles.questionsSection}>
          <div className={styles.questionsSectionHeader}>
            <h4>Questions</h4>
            <Button variant="secondary" size="sm" onClick={addQuestion}>
              + Add question
            </Button>
          </div>
          {questions.map((q, i) => (
            <div key={q.id} className={styles.questionBlock}>
              <div className={styles.questionBlockHeader}>
                <span className={styles.questionNum}>Q{i + 1}</span>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(q.id)}
                    aria-label={`Remove question ${i + 1}`}
                    className={styles.removeBtn}
                  >
                    ×
                  </button>
                )}
              </div>
              <input
                value={q.text}
                onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                placeholder="Question text…"
                className={styles.questionTextInput}
              />
              <div className={styles.questionInputs}>
                <select value={q.type} onChange={(e) => updateQuestion(q.id, "type", e.target.value)}>
                  {QUESTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === "scale" ? "Scale (1–10)" : "Free text"}
                    </option>
                  ))}
                </select>
                {q.type === "scale" && (
                  <>
                    <input
                      value={q.minLabel}
                      onChange={(e) => updateQuestion(q.id, "minLabel", e.target.value)}
                      placeholder="Low label"
                    />
                    <input
                      value={q.maxLabel}
                      onChange={(e) => updateQuestion(q.id, "maxLabel", e.target.value)}
                      placeholder="High label"
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.modalActions}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isEdit ? "Save changes" : "Save questionnaire"}</Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Assign modal ───────────────────────────────────────────

function AssignModal({
  questionnaire,
  clients,
  onClose,
}: {
  questionnaire: Questionnaire;
  clients: UserProfile[];
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const assignments = useAppSelector(selectAssignmentsByQuestionnaire(questionnaire.id));
  const assignedIds = new Set(assignments.map((a) => a.user_id));
  console.log("assignments:", assignments, "assignedIds:", assignedIds);

  const toggle = (userId: string) => {
    if (assignedIds.has(userId)) {
      dispatch(
        unassignQuestionnaireByIds({
          questionnaire_id: questionnaire.id,
          user_id: userId,
        }),
      );
    } else {
      dispatch(
        assignQuestionnaire({
          questionnaire_id: questionnaire.id,
          user_id: userId,
        }),
      );
    }
  };

  return (
    <div className={styles.overlay}>
      <Card className={styles.assignModal}>
        <h3 className={styles.modalTitle}>Assign clients</h3>
        <p className={styles.assignSubtitle}>
          Select which clients should receive <strong>{questionnaire.title}</strong>.
        </p>

        {clients.length === 0 ? (
          <p className={styles.emptyText}>No clients found.</p>
        ) : (
          <ul className={styles.clientList}>
            {clients.map((client) => {
              const assigned = assignedIds.has(client.id);
              return (
                <li
                  key={client.id}
                  className={`${styles.clientRow} ${assigned ? styles.clientRowAssigned : ""}`}
                  onClick={() => toggle(client.id)}
                >
                  <input
                    type="checkbox"
                    checked={assigned}
                    onChange={() => toggle(client.id)}
                    className={styles.clientCheckbox}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className={styles.clientName}>
                    {client.first_name} {client.last_name}
                  </span>
                  {assigned && <span className={styles.assignedBadge}>Assigned</span>}
                </li>
              );
            })}
          </ul>
        )}

        <div className={styles.modalActions}>
          <Button onClick={onClose}>Done</Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────

export default function AdminQuestionnairesPage() {
  const dispatch = useAppDispatch();
  const questionnaires = useAppSelector(selectAllQuestionnaires);
  const clients = useAppSelector(selectClientUsers);

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingQ, setEditingQ] = useState<Questionnaire | null>(null);
  const [isAssigningQ, setIsAssigningQ] = useState<Questionnaire | null>(null);

  useFetchOnIdle(
    (state: RootState) => state.questionnaires.status,
    () => fetchQuestionnaires(),
    "Failed to fetch questionnaires:",
  );

  useFetchOnIdle(
    (state: RootState) => state.userDirectory.status,
    () => fetchAllUsers(),
    "Failed to fetch users:",
  );

  // When assign modal opens, fetch latest assignments for that questionnaire
  useEffect(() => {
    if (isAssigningQ) {
      dispatch(fetchAssignmentsByQuestionnaire(isAssigningQ.id));
    }
  }, [isAssigningQ, dispatch]);

  const handleCreate = (data: any) => dispatch(createQuestionnaire(data));

  const handleEdit = (data: any) => {
    if (!editingQ) return;
    dispatch(updateQuestionnaire({ id: editingQ.id, ...data }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Questionnaires</h1>
            <p>{questionnaires.length} check-ins configured</p>
          </div>
          <Button onClick={() => setShowBuilder(true)}>+ New questionnaire</Button>
        </div>

        <div className={styles.list}>
          {questionnaires.map((q) => (
            <Card key={q.id}>
              <div className={styles.qCard}>
                <div className={styles.qCardInner}>
                  <div className={styles.qInfo}>
                    <div className={styles.qTitleRow}>
                      <h3>{q.title}</h3>
                      <span className={`${styles.badge} ${q.is_active ? styles.active : styles.inactive}`}>
                        {q.is_active ? "Active" : "Paused"}
                      </span>
                    </div>
                    <p className={styles.qDesc}>{q.description}</p>
                    <p className={styles.qMeta}>
                      {q.questions.length} questions · {q.frequency} · {q.assignedTo?.length ?? 0} clients assigned
                    </p>
                  </div>
                  <div className={styles.qActions}>
                    <Button variant="secondary" size="sm" onClick={() => setIsAssigningQ(q)}>
                      Assign
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setEditingQ(q)}>
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => dispatch(pauseQuestionnaire({ id: q.id, is_active: !q.is_active }))}
                    >
                      {q.is_active ? "Pause" : "Activate"}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => dispatch(deleteQuestionnaire(q.id))}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {questionnaires.length === 0 && (
            <p className={styles.empty}>No questionnaires yet. Create your first one above.</p>
          )}
        </div>
      </div>

      {showBuilder && <QuestionnaireBuilder onSave={handleCreate} onClose={() => setShowBuilder(false)} />}

      {editingQ && <QuestionnaireBuilder initial={editingQ} onSave={handleEdit} onClose={() => setEditingQ(null)} />}

      {isAssigningQ && (
        <AssignModal questionnaire={isAssigningQ} clients={clients} onClose={() => setIsAssigningQ(null)} />
      )}
    </div>
  );
}
