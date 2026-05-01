import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  createQuestionnaire,
  selectActiveQuestionnaires,
  selectQuestionnairesByFrequency,
  selectAllQuestionnaires,
  fetchQuestionnaires,
} from "../../../store/slices/questionnairesSlice";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import styles from "./AdminQuestionnairesPage.module.scss";
import type { AppDispatch } from '../../../store/index';


const QUESTION_TYPES = ["scale", "text"];

function QuestionnaireBuilder({
  onSave,
  onClose,
}: {
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDesc] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [questions, setQuestions] = useState([
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
  ]);

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
  const removeQuestion = (id: string) =>
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  const updateQuestion = (id: string, field: string, value: string) =>
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );

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
        <h3 className={styles.modalTitle}>New questionnaire</h3>

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
            <select
              id="q-freq"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
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
                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(q.id, "type", e.target.value)}
                >
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
                      onChange={(e) =>
                        updateQuestion(q.id, "minLabel", e.target.value)
                      }
                      placeholder="Low label"
                    />
                    <input
                      value={q.maxLabel}
                      onChange={(e) =>
                        updateQuestion(q.id, "maxLabel", e.target.value)
                      }
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
          <Button onClick={handleSave}>Save questionnaire</Button>
        </div>
      </Card>
    </div>
  );
}

export default function AdminQuestionnairesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const questionnaires = useSelector(selectAllQuestionnaires);
  const [showBuilder, setShowBuilder] = useState(false);

  const questionnaireStatus = useSelector(
    (state: RootState) => state.questionnaires.status,
  );

  useEffect(() => {
    if (questionnaireStatus === "idle") {
      dispatch(fetchQuestionnaires())
        .unwrap()
        .catch((err) => {
          console.error("Failed to fetch questionnaires:", err);
        });
    }
  }, [dispatch, questionnaireStatus]);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Questionnaires</h1>
            <p>{questionnaires.length} check-ins configured</p>
          </div>
          <Button onClick={() => setShowBuilder(true)}>
            + New questionnaire
          </Button>
        </div>

        <div className={styles.list}>
          {questionnaires.map((q) => (
            <Card key={q.id}>
              <div className={styles.qCard}>
                <div className={styles.qCardInner}>
                  <div className={styles.qInfo}>
                    <div className={styles.qTitleRow}>
                      <h3>{q.title}</h3>
                      <span
                        className={`${styles.badge} ${q.is_active ? styles.active : styles.inactive}`}
                      >
                        {q.is_active ? "Active" : "Paused"}
                      </span>
                    </div>
                    <p className={styles.qDesc}>{q.description}</p>
                    <p className={styles.qMeta}>
                      {q.questions.length} questions · {q.frequency} ·{" "}
                      {q.assignedTo?.length ?? 0} clients assigned
                    </p>
                  </div>
                  <div className={styles.qActions}>
                    <Button
                      variant="secondary"
                      size="sm"
                      //onClick={() => dispatch(toggleActive(q.id))}
                    >
                      {q.is_active ? "Pause" : "Activate"}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      //onClick={() => dispatch(deleteQuestionnaire(q.id))}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {questionnaires.length === 0 && (
            <p className={styles.empty}>
              No questionnaires yet. Create your first one above.
            </p>
          )}
        </div>
      </div>

      {showBuilder && (
        <QuestionnaireBuilder
          onSave={(data) =>
            dispatch(createQuestionnaire(data))
          }
          onClose={() => setShowBuilder(false)}
        />
      )}
    </div>
  );
}
