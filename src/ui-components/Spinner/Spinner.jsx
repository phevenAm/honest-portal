import styles from './Spinner.module.css';

export default function Spinner({ size = 40 }) {
  return (
    <div className={styles.wrapper}>
      <div
        className={styles.spinner}
        style={{ width: size, height: size }}
      />
    </div>
  );
}