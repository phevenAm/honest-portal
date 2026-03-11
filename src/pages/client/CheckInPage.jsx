// ============================================================
// CHECK-IN PAGE — client completes a questionnaire
// Demonstrates: local component state, Redux dispatch on submit,
// step-by-step form UX
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { selectActiveQuestionnaires } from '../../store/slices/questionnairesSlice';
import { submitResponse } from '../../store/slices/responsesSlice';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';

// Scale question component
function ScaleQuestion({ question, value, onChange }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: 20, lineHeight: 1.5 }}>
        {question.text}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Number buttons */}
        <div
          role="radiogroup"
          aria-label={question.text}
          style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}
        >
          {Array.from({ length: question.max }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              role="radio"
              aria-checked={value === n}
              onClick={() => onChange(n)}
              style={{
                width: 44, height: 44,
                borderRadius: 'var(--r-md)',
                border: value === n ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                background: value === n ? 'var(--accent-light)' : 'var(--bg-muted)',
                color: value === n ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: value === n ? 700 : 400,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all var(--transition)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {n}
            </button>
          ))}
        </div>
        {/* Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>{question.minLabel}</span>
          <span>{question.maxLabel}</span>
        </div>
      </div>
    </div>
  );
}

export default function CheckInPage() {
  const dispatch       = useDispatch();
  const navigate       = useNavigate();
  const user           = useSelector(selectCurrentUser);
  const questionnaires = useSelector(selectActiveQuestionnaires);

  // For simplicity, use the first assigned questionnaire
  const questionnaire = questionnaires.find(q => q.assignedTo.includes(user?.id));

  const [answers, setAnswers]       = useState({});
  const [submitted, setSubmitted]   = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  if (!questionnaire) {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>No check-ins are currently assigned to you.</p>
      </div>
    );
  }

  const questions = questionnaire.questions;
  const currentQ  = questions[currentStep];
  const isLast    = currentStep === questions.length - 1;
  const canProceed = currentQ.type === 'text' || answers[currentQ.id] !== undefined;

  const handleAnswer = (value) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
  };

  const handleNext = () => {
    if (isLast) {
      handleSubmit();
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  const handleSubmit = () => {
    // Build scores and textResponses from answers
    const scores = {};
    const textResponses = {};
    questions.forEach(q => {
      if (q.type === 'scale') scores[q.id] = answers[q.id] || 5;
      if (q.type === 'text')  textResponses[q.id] = answers[q.id] || '';
    });

    dispatch(submitResponse({
      userId: user.id,
      questionnaireId: questionnaire.id,
      scores,
      textResponses,
      week: 999, // In real app, calculate the current week number
    }));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg-base)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}>
        <Card style={{ maxWidth: 480, width: '100%', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🌸</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: 12, fontWeight: 500 }}>
            Thank you, {user.name.split(' ')[0]}
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
            Your check-in has been recorded. Each one is a small act of self-care — well done for showing up today.
          </p>
          <Button onClick={() => navigate('/dashboard')} fullWidth>
            View my progress
          </Button>
        </Card>
      </div>
    );
  }

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 500, marginBottom: 6 }}>
            {questionnaire.title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{questionnaire.description}</p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={{
            height: 6, background: 'var(--bg-muted)', borderRadius: 'var(--r-full)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 'var(--r-full)',
              background: 'linear-gradient(90deg, var(--sage), var(--lavender))',
              width: `${progress}%`,
              transition: 'width 400ms ease',
            }} />
          </div>
        </div>

        {/* Question card */}
        <Card style={{ padding: '32px', marginBottom: 20 }}>
          {currentQ.type === 'scale' ? (
            <ScaleQuestion
              question={currentQ}
              value={answers[currentQ.id]}
              onChange={handleAnswer}
            />
          ) : (
            <div>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: 16, lineHeight: 1.5 }}>
                {currentQ.text}
              </p>
              <textarea
                aria-label={currentQ.text}
                value={answers[currentQ.id] || ''}
                onChange={e => handleAnswer(e.target.value)}
                placeholder="Take a moment to reflect… (optional)"
                rows={4}
                style={{
                  width: '100%', padding: '12px 14px',
                  border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)',
                  background: 'var(--bg-base)', color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)', fontSize: '0.95rem',
                  resize: 'vertical', outline: 'none',
                  transition: 'border-color var(--transition)',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            disabled={currentStep === 0}
          >
            ← Back
          </Button>
          <Button onClick={handleNext} disabled={!canProceed}>
            {isLast ? 'Submit check-in' : 'Next →'}
          </Button>
        </div>

      </div>
    </div>
  );
}
