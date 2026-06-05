import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, selectThemeMode } from '../../../store/slices/themeSlice';
import { LogoIcon, MoonIcon, SunIcon, MenuIcon, CloseIcon } from '../Icons/Icons';
import Avatar from '../Avatar/Avatar';
import { useAuth } from '../../../context/AuthContext';
import styles from './Navbar.module.scss';




export default function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
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
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/clients', label: 'Clients' },
    { to: '/admin/questionnaires', label: 'Questionnaires' },
    { to: '/admin/resources', label: 'Resources' },
  ];

  const clientLinks = [
    { to: '/dashboard', label: 'My Progress' },
    { to: '/check-in', label: 'Check-in' },
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
