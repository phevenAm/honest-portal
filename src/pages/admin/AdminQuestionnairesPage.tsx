// ============================================================
// ADMIN QUESTIONNAIRES PAGE — create and manage check-ins
// ============================================================

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAllQuestionnaires, addQuestionnaire,
  deleteQuestionnaire, toggleActive,
} from '../../store/slices/questionnairesSlice';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';

const QUESTION_TYPES = ['scale', 'text'];

function QuestionnaireBuilder({ onSave, onClose }) {
  const [title, setTitle]         = useState('');
  const [description, setDesc]    = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [questions, setQuestions] = useState([
    { id: `nq-${Date.now()}`, text: '', type: 'scale', min: 1, max: 10, minLabel: '', maxLabel: '' },
  ]);

  const addQuestion = () => {
    setQuestions(qs => [...qs, {
      id: `nq-${Date.now()}`, text: '', type: 'scale', min: 1, max: 10, minLabel: '', maxLabel: '',
    }]);
  };

  const removeQuestion = (id) => setQuestions(qs => qs.filter(q => q.id !== id));

  const updateQuestion = (id, field, value) => {
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleSave = () => {
    if (!title.trim() || questions.some(q => !q.text.trim())) {
      alert('Please fill in a title and all question texts');
      return;
    }
    onSave({ title, description, frequency, questions });
    onClose();
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)',
    background: 'var(--bg-base)', color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)', fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.45)',
      overflowY: 'auto',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px',
    }}>
      <Card style={{ width: '100%', maxWidth: 640, padding: 32 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: 24 }}>
          New questionnaire
        </h3>

        {/* Meta */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, marginBottom: 5, color: 'var(--text-secondary)' }}>Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weekly Wellbeing Check-in" style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, marginBottom: 5, color: 'var(--text-secondary)' }}>Description</label>
            <input value={description} onChange={e => setDesc(e.target.value)} placeholder="Brief description for your client" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, marginBottom: 5, color: 'var(--text-secondary)' }}>Frequency</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value)} style={{ ...inputStyle }}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
            </select>
          </div>
        </div>

        {/* Questions */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ fontSize: '0.95rem' }}>Questions</h4>
            <Button variant="secondary" size="sm" onClick={addQuestion}>＋ Add question</Button>
          </div>

          {questions.map((q, i) => (
            <div key={q.id} style={{
              padding: '16px', background: 'var(--bg-muted)',
              borderRadius: 'var(--r-md)', marginBottom: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Q{i + 1}</span>
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(q.id)} aria-label={`Remove question ${i + 1}`} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--danger)', fontSize: '1.1rem',
                  }}>×</button>
                )}
              </div>
              <input
                value={q.text}
                onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                placeholder="Question text…"
                style={{ ...inputStyle, marginBottom: 10, background: 'var(--bg-card)' }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <select
                  value={q.type}
                  onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                  style={{ ...inputStyle, width: 'auto', flex: 1, background: 'var(--bg-card)' }}
                >
                  {QUESTION_TYPES.map(t => <option key={t} value={t}>{t === 'scale' ? 'Scale (1–10)' : 'Free text'}</option>)}
                </select>
                {q.type === 'scale' && (
                  <>
                    <input value={q.minLabel} onChange={e => updateQuestion(q.id, 'minLabel', e.target.value)} placeholder="Low label" style={{ ...inputStyle, flex: 1, background: 'var(--bg-card)' }} />
                    <input value={q.maxLabel} onChange={e => updateQuestion(q.id, 'maxLabel', e.target.value)} placeholder="High label" style={{ ...inputStyle, flex: 1, background: 'var(--bg-card)' }} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save questionnaire</Button>
        </div>
      </Card>
    </div>
  );
}

export default function AdminQuestionnairesPage() {
  const dispatch       = useDispatch();
  const questionnaires = useSelector(selectAllQuestionnaires);
  const [showBuilder, setShowBuilder] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 500, marginBottom: 6 }}>Questionnaires</h1>
            <p style={{ color: 'var(--text-muted)' }}>{questionnaires.length} check-ins configured</p>
          </div>
          <Button onClick={() => setShowBuilder(true)}>＋ New questionnaire</Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {questionnaires.map(q => (
            <Card key={q.id} style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontSize: '1rem' }}>{q.title}</h3>
                    <span style={{
                      fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--r-full)',
                      background: q.isActive ? 'var(--sage-light)' : 'var(--bg-muted)',
                      color: q.isActive ? 'var(--sage-dark)' : 'var(--text-muted)',
                      fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {q.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>{q.description}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {q.questions.length} questions · {q.frequency} · {q.assignedTo.length} clients assigned
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="secondary" size="sm" onClick={() => dispatch(toggleActive(q.id))}>
                    {q.isActive ? 'Pause' : 'Activate'}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => dispatch(deleteQuestionnaire(q.id))}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {questionnaires.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              No questionnaires yet. Create your first one above.
            </div>
          )}
        </div>
      </div>

      {showBuilder && (
        <QuestionnaireBuilder
          onSave={(data) => dispatch(addQuestionnaire(data))}
          onClose={() => setShowBuilder(false)}
        />
      )}
    </div>
  );
}
