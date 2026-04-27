import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../../context/AuthContext';
import { selectActiveQuestionnaires } from '../../../store/slices/questionnairesSlice';
import { submitResponse } from '../../../store/slices/responsesSlice';
import Card from '../../../components/shared/Card/Card';
import Button from '../../../components/shared/Button/Button';
import styles from './CheckInPage.module.scss';

const CheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

function ScaleQuestion({ question, value, onChange }: { question: any; value: number | undefined; onChange: (n: number) => void }) {
  return (
    <div className={styles.scaleWrap}>
      <div role="radiogroup" aria-label={question.text} className={styles.scaleButtons}>
        {Array.from({ length: question.max }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            role="radio"
            aria-checked={value === n}
            onClick={() => onChange(n)}
            className={value === n ? styles.scaleBtnActive : styles.scaleBtn}
          >
            {n}
          </button>
        ))}
      </div>
      <div className={styles.scaleLabels}>
        <span>{question.minLabel}</span>
        <span>{question.maxLabel}</span>
      </div>
    </div>
  );
}

export default function CheckInPage() {
  const dispatch       = useDispatch();
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const questionnaires = useSelector(selectActiveQuestionnaires);
  const questionnaire  = questionnaires.find(q => q.assignedTo.includes(user?.id));

  const [answers, setAnswers]         = useState<Record<string, any>>({});
  const [submitted, setSubmitted]     = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  if (!questionnaire) return (
    <div className={styles.emptyState}>
      <p>No check-ins are currently assigned to you.</p>
    </div>
  );

  const questions   = questionnaire.questions;
  const currentQ    = questions[currentStep];
  const isLast      = currentStep === questions.length - 1;
  const canProceed  = currentQ.type === 'text' || answers[currentQ.id] !== undefined;
  const progress    = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (value: any) => setAnswers(prev => ({ ...prev, [currentQ.id]: value }));

  const handleNext = () => {
    if (isLast) {
      const scores: Record<string, number> = {};
      const textResponses: Record<string, string> = {};
      questions.forEach((q: any) => {
        if (q.type === 'scale') scores[q.id]        = answers[q.id] || 5;
        if (q.type === 'text')  textResponses[q.id] = answers[q.id] || '';
      });
      dispatch(submitResponse({ userId: user!.id, questionnaireId: questionnaire.id, scores, textResponses, week: 999 }));
      setSubmitted(true);
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  if (submitted) return (
    <div className={styles.completePage}>
      <Card className={styles.completeCard}>
        <div className={styles.completeIconWrap}><CheckIcon /></div>
        <h2 className={styles.completeTitle}>Thank you, {user?.first_name}</h2>
        <p className={styles.completeText}>
          Your check-in has been recorded. Each one is a small act of self-care — well done for showing up today.
        </p>
        <Button onClick={() => navigate('/dashboard')} fullWidth>View my progress</Button>
      </Card>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1>{questionnaire.title}</h1>
          <p>{questionnaire.description}</p>
        </div>

        <div className={styles.progressMeta}>
          <span>Question {currentStep + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        <Card className={styles.questionCard}>
          <p className={styles.questionText}>{currentQ.text}</p>
          {currentQ.type === 'scale' ? (
            <ScaleQuestion question={currentQ} value={answers[currentQ.id]} onChange={handleAnswer} />
          ) : (
            <textarea
              aria-label={currentQ.text}
              value={answers[currentQ.id] || ''}
              onChange={e => handleAnswer(e.target.value)}
              placeholder="Take a moment to reflect… (optional)"
              rows={4}
              className={styles.textarea}
            />
          )}
        </Card>

        <div className={styles.navRow}>
          <Button variant="ghost" onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0}>
            Back
          </Button>
          <Button onClick={handleNext} disabled={!canProceed}>
            {isLast ? 'Submit check-in' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
