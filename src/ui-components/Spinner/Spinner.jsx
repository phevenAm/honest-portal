import React from 'react';
// import styles from './Spinner.module.css';

export default function Spinner({ size = 40 }) {
  return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.spinner, width: size, height: size }} />
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  spinner: {
    border: '4px solid rgba(0,0,0,0.1)',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};