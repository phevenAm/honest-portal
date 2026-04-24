// ============================================================
// BUTTON — reusable, accessible button component
// Variants: primary | secondary | ghost | danger
// ============================================================

import React from 'react';

const styles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    fontSize: '0.9rem',
    borderRadius: 'var(--r-full)',
    border: '1.5px solid transparent',
    cursor: 'pointer',
    transition: 'all var(--transition)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  sizes: {
    sm: { padding: '6px 14px', fontSize: '0.8rem' },
    md: { padding: '10px 20px' },
    lg: { padding: '13px 28px', fontSize: '1rem' },
  },
  variants: {
    primary: {
      background: 'var(--accent)',
      color: 'var(--text-inverse)',
      borderColor: 'var(--accent)',
    },
    secondary: {
      background: 'var(--accent-light)',
      color: 'var(--accent)',
      borderColor: 'var(--accent-light)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      borderColor: 'var(--border)',
    },
    danger: {
      background: 'var(--blush-light)',
      color: 'var(--danger)',
      borderColor: 'var(--blush-light)',
    },
  },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
  'aria-label': ariaLabel,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        ...styles.base,
        ...styles.sizes[size],
        ...styles.variants[variant],
        width: fullWidth ? '100%' : undefined,
        justifyContent: fullWidth ? 'center' : undefined,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      {...props}
    >
      {children}
    </button>
  );
}
