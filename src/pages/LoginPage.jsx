import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { signIn, selectIsAuthenticated, selectLoginError, selectIsAdmin, clearError } from '../store/slices/authSlice';

export default function LoginPage() {
  const dispatch        = useDispatch();
  const navigate        = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin         = useSelector(selectIsAdmin);
  const loginError = useSelector(selectLoginError)
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
dispatch(signIn({ email, password })) .then(result => {
    if (result.success) {
      navigate(result.role === 'admin' ? '/admin' : '/dashboard');
    }
})

    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '10px 13px',
    border: '1.5px solid var(--border)', borderRadius: 12,
    background: 'var(--bg-muted)', color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)', fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', top: '-8%', right: '-6%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, var(--lavender-light), transparent 70%)', opacity: .8 }} />
      <div style={{ position: 'absolute', bottom: '-6%', left: '-4%', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, var(--sage-light), transparent 70%)', opacity: .8 }} />

      <div style={{ width: '100%', maxWidth: 380, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--sage-light), var(--lavender-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 14px' }}>🌿</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, margin: '0 0 5px' }}>MindfulSpace</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>A safe space for your journey</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow-lg)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, margin: '0 0 22px' }}>Hello!</h2>

          {loginError && (
            <div role="alert" style={{ background: 'var(--blush-light)', color: 'var(--danger)', border: '1px solid var(--blush)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="email" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>Email address</label>
              <input
                id="email" type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label htmlFor="password" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>Password</label>
              <input
                id="password" type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 11, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 999, fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}