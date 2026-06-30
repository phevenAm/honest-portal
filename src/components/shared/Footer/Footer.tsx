import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import styles from "./Footer.module.scss";

export default function Footer() {
  const { isAdmin } = useAuth();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className={styles.footer}>
      <span>
        <em>Abide:</em> WithMe
      </span>
      {isAdmin && (
        <Link to="/admin/audit-logs" className={styles.auditLink}>
          {now.toLocaleString()}
        </Link>
      )}
    </footer>
  );
}
