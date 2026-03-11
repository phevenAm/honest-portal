// ============================================================
// LOGIN PAGE
// Demonstrates: useDispatch, useSelector, thunk dispatch,
// controlled form inputs, navigate on success
// ============================================================

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, selectIsAuthenticated, selectLoginError, selectIsAdmin, clearError } from '../store/slices/authSlice';
import Button from '../components/shared/Button';

export default function LoginPage() {
  const dispatch        = useDispatch();
  const navigate        = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin         = useSelector(selectIsAdmin);
  const loginError      = useSelector(selectLoginError);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Clear error when user starts typing again
  useEffect(() => {
    if (loginError) dispatch(clearError());
  }, [email, password]); // eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = dispatch(loginUser(email, password));
    if (result.success) {
      navigate(result.role === 'admin' ? '/admin' : '/dashboard');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Background decoration */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '40vw', height: '40vw', maxWidth: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--lavender-light) 0%, transparent 70%)',
          opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute', bottom: '-5%', left: '-5%',
          width: '35vw', height: '35vw', maxWidth: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--sage-light) 0%, transparent 70%)',
          opacity: 0.6,
        }} />
      </div>

      <main style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--sage-light), var(--lavender-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 16px',
          }}>
            🌿
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 500, marginBottom: 6 }}>
            MindfulSpace
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            A safe space for your journey
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding: '36px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 24, fontFamily: 'var(--font-serif)', fontWeight: 500 }}>
            Welcome back
          </h2>

          {loginError && (
            <div
              role="alert"
              style={{
                background: 'var(--blush-light)', color: 'var(--danger)',
                border: '1px solid var(--blush)', borderRadius: 'var(--r-md)',
                padding: '12px 16px', marginBottom: 20, fontSize: '0.85rem',
              }}
            >
              {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="email"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)', fontSize: '0.95rem',
                  outline: 'none', transition: 'border-color var(--transition)',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="password"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)', fontSize: '0.95rem',
                  outline: 'none', transition: 'border-color var(--transition)',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <Button type="submit" fullWidth disabled={loading || !email || !password}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {/* Dev helper credentials */}
          <div style={{
            marginTop: 28, padding: '14px', background: 'var(--bg-muted)',
            borderRadius: 'var(--r-md)', fontSize: '0.78rem', color: 'var(--text-muted)',
          }}>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>🔑 Demo credentials:</p>
            <p><strong>Admin:</strong> rosie@abide.co.uk / admin123</p>
            <p><strong>Client:</strong> sarah.chen@email.com / client123</p>
            <p><strong>Client:</strong> user@abide.co.uk / client123</p>
          </div>
        </div>
      </main>
    </div>
  );
}
