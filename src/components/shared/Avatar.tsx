import React from 'react';

const COLOR_MAP = {
  sage:     { bg: 'var(--sage-light)',     text: 'var(--sage-dark)' },
  lavender: { bg: 'var(--lavender-light)', text: 'var(--lavender)' },
  blush:    { bg: 'var(--blush-light)',    text: 'var(--blush)' },
  sky:      { bg: 'var(--sky-light)',      text: 'var(--sky)' },
  peach:    { bg: 'var(--peach-light)',    text: 'var(--peach)' },
};

export default function Avatar({ initials, color = 'sage', size = 40 }) {
  const { bg, text } = COLOR_MAP[color] || COLOR_MAP.sage;
  return (
    <div
      aria-hidden="true"
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: bg,
        color: text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: size * 0.35,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {initials}
    </div>
  );
}
