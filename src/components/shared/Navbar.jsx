// ============================================================
// NAVBAR — responsive, accessible navigation
// Renders different links for admin vs client
// ============================================================

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser, selectIsAdmin } from '../../store/slices/authSlice';
import { toggleTheme, selectThemeMode } from '../../store/slices/themeSlice';
import Avatar from './Avatar';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function Navbar() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const location    = useLocation();
  const user        = useSelector(selectCurrentUser);
  const isAdmin     = useSelector(selectIsAdmin);
  const themeMode   = useSelector(selectThemeMode);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin',              label: 'Dashboard' },
    { to: '/admin/clients',      label: 'Clients' },
    { to: '/admin/questionnaires', label: 'Questionnaires' },
    { to: '/admin/resources',    label: 'Resources' },
  ];

  const clientLinks = [
    { to: '/dashboard',          label: 'My Progress' },
    { to: '/check-in',           label: 'Check-in' },
    { to: '/resources',          label: 'Resources' },
  ];

  const links = isAdmin ? adminLinks : clientLinks;

  return (
    <header role="banner" style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(8px)',
    }}>
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Logo */}
        <Link
          to={isAdmin ? '/admin' : '/dashboard'}
          aria-label="MindfulSpace — home"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--sage-light), var(--lavender-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>🌿</div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 500 }}>
            MindfulSpace
          </span>
          {isAdmin && (
            <span style={{
              fontSize: '0.7rem', background: 'var(--lavender-light)', color: 'var(--lavender)',
              padding: '2px 8px', borderRadius: 'var(--r-full)', fontWeight: 600, letterSpacing: '0.05em',
            }}>
              ADMIN
            </span>
          )}
        </Link>

        {/* Desktop Nav Links */}
        <ul role="list" style={{
          display: 'flex', alignItems: 'center', gap: 4,
          listStyle: 'none', margin: 0, padding: 0,
          '@media (max-width: 768px)': { display: 'none' },
        }} className="desktop-nav">
          {links.map(link => {
            const active = location.pathname === link.to;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--r-full)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    background: active ? 'var(--accent-light)' : 'transparent',
                    transition: 'all var(--transition)',
                    display: 'block',
                  }}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
            style={{
              background: 'var(--bg-muted)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-full)', padding: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)',
              transition: 'all var(--transition)',
            }}
          >
            {themeMode === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>

          {/* User info */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar initials={user.avatar} color={user.color} size={34} />
              <button
                onClick={handleLogout}
                aria-label="Sign out"
                style={{
                  background: 'none', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-full)', padding: '6px 14px',
                  cursor: 'pointer', color: 'var(--text-secondary)',
                  fontSize: '0.85rem', transition: 'all var(--transition)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Sign out
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="mobile-menu-btn"
            style={{
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)', padding: '6px',
              cursor: 'pointer', color: 'var(--text-secondary)',
              display: 'none', alignItems: 'center',
            }}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div id="mobile-menu" style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-card)',
          padding: '12px 24px 20px',
        }}>
          <ul role="list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {links.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block', padding: '10px 14px',
                    borderRadius: 'var(--r-md)',
                    textDecoration: 'none',
                    color: location.pathname === link.to ? 'var(--accent)' : 'var(--text-primary)',
                    background: location.pathname === link.to ? 'var(--accent-light)' : 'transparent',
                    fontWeight: location.pathname === link.to ? 600 : 400,
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
