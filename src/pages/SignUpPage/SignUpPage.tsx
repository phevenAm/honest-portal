import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './SignUpPage.module.scss';

function getMinAgeDate(age = 11) {
  const today = new Date();
  return new Date(today.getFullYear() - age, today.getMonth(), today.getDate())
    .toISOString().split('T')[0];
}

const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22V12"/>
    <path d="M12 12C12 7 7 3 2 3c0 5 4 9 10 9z"/>
    <path d="M12 12C12 7 17 3 22 3c0 5-4 9-10 9z"/>
  </svg>
);

const MailIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const FIELDS = [
  { id: 'firstName', label: 'First name',       type: 'text',     ph: '' },
  { id: 'lastName',  label: 'Last name',        type: 'text',     ph: '' },
  { id: 'email',     label: 'Email address',    type: 'email',    ph: 'you@example.com' },
  { id: 'dob',       label: 'Date of birth',    type: 'date',     ph: '' },
  { id: 'password',  label: 'Password',         type: 'password', ph: '••••••••' },
  { id: 'confirm',   label: 'Confirm password', type: 'password', ph: '••••••••' },
] as const;

type FieldId = typeof FIELDS[number]['id'];

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [form, setForm] = useState<Record<FieldId, string>>({
    firstName: '', lastName: '', email: '', dob: '', password: '', confirm: '',
  });
  const [error, setError]     = useState('');
  const [done, setDone]       = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (id: FieldId, value: string) =>
    setForm(f => ({ ...f, [id]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signUp(form.email, form.password, {
        first_name: form.firstName,
        last_name:  form.lastName,
        dob:        form.dob,
      });
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className={styles.confirmPage}>
      <div className={styles.confirmBox}>
        <div className={styles.confirmIconWrap}><MailIcon /></div>
        <h2 className={styles.confirmTitle}>Check your email</h2>
        <p className={styles.confirmText}>
          We've sent a confirmation link to <strong>{form.email}</strong>.
          Click it to activate your account, then come back to sign in.
          Check your spam folder if you don't see it within a few minutes.
        </p>
        <Link to="/login" className={styles.backLink}>← Back to sign in</Link>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.blobTop} aria-hidden="true" />
      <div className={styles.blobBottom} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.logoWrap}>
          <div className={styles.logoMark}><LogoIcon /></div>
          <h1 className={styles.logoTitle}>WithMe</h1>
          <p className={styles.logoSub}>Create your account</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.heading}>Get started</h2>

          {error && <div role="alert" className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {FIELDS.map(f => (
              <div key={f.id} className={styles.field}>
                <label htmlFor={f.id} className={styles.label}>{f.label}</label>
                <input
                  id={f.id}
                  type={f.type}
                  value={form[f.id]}
                  onChange={e => set(f.id, e.target.value)}
                  placeholder={f.ph}
                  required
                  autoComplete={
                    f.id === 'email'    ? 'email' :
                    f.id === 'password' ? 'new-password' :
                    f.id === 'confirm'  ? 'new-password' : undefined
                  }
                  {...(f.type === 'date' && { max: getMinAgeDate(11) })}
                  className={styles.input}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading || !form.email || !form.password || !form.confirm}
              className={styles.submitBtn}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className={styles.footer}>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
