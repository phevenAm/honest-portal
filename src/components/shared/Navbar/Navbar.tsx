import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, selectThemeMode } from '../../../store/slices/themeSlice';
import Avatar from '../Avatar/Avatar';
import { useAuth } from '../../../context/AuthContext';
import styles from './Navbar.module.scss';

// ── SVG Icons ──────────────────────────────────────────────
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// Simple leaf/plant SVG for logo mark — no emojis
const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22V12"/>
    <path d="M12 12C12 7 7 3 2 3c0 5 4 9 10 9z"/>
    <path d="M12 12C12 7 17 3 22 3c0 5-4 9-10 9z"/>
  </svg>
);

export default function Navbar() {
  const dispatch  = useDispatch();
  const location  = useLocation();
  const themeMode = useSelector(selectThemeMode);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAdmin, signOut, profile } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const adminLinks = [
    { to: '/admin',                label: 'Dashboard' },
    { to: '/admin/clients',        label: 'Clients' },
    { to: '/admin/questionnaires', label: 'Questionnaires' },
    { to: '/admin/resources',      label: 'Resources' },
  ];

  const clientLinks = [
    { to: '/dashboard', label: 'My Progress' },
    { to: '/check-in',  label: 'Check-in' },
    { to: '/resources', label: 'Resources' },
  ];

  const links = isAdmin ? adminLinks : clientLinks;

  return (
    <header role="banner" className={styles.header}>
      <nav role="navigation" aria-label="Main navigation" className={styles.nav}>

        {/* Logo */}
        <Link
          to={isAdmin ? '/admin' : '/dashboard'}
          aria-label="WithMe — home"
          className={styles.logo}
        >
          <div className={styles.logoMark}>
            <LogoIcon />
          </div>
          <span className={styles.logoText}>WithMe</span>
          {isAdmin && <span className={styles.adminBadge}>Admin</span>}
        </Link>

        {/* Desktop nav links */}
        <ul className={styles.desktopNav} role="list">
          {links.map(link => {
            const active = location.pathname === link.to;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  aria-current={active ? 'page' : undefined}
                  className={`${styles.navLink} ${active ? styles.active : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right actions */}
        <div className={styles.actions}>
          <button
            onClick={() => dispatch(toggleTheme())}
            aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
            className={styles.iconBtn}
          >
            {themeMode === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>

          <div className={styles.userSection}>
            {profile && (
              <Avatar
                initials={`${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`}
                color="teal"
                size={34}
              />
            )}
            <button onClick={handleLogout} aria-label="Sign out" className={styles.signOutBtn}>
              Sign out
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className={styles.menuBtn}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div id="mobile-menu" className={styles.mobileMenu}>
          <ul role="list" className={styles.mobileMenuList}>
            {links.map(link => {
              const active = location.pathname === link.to;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={`${styles.mobileNavLink} ${active ? styles.active : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
