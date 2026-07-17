import { createContext, useCallback, useContext, useRef, useState } from "react";

import styles from "./ToastContext.module.scss";

type ToastColourType = "warning" | "success" | "danger" | "neutral";
type ToastContextType = { showToast: (msg: string, type?: ToastColourType) => void };

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastColourType | null>("neutral");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, type: ToastColourType = "neutral") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    setToastType(type);
    timerRef.current = setTimeout(() => {
      setMessage(null);
      setToastType("neutral");
    }, 8000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div className={[styles.toast, styles[toastType ?? "neutral"]].join(" ")} role="status" aria-live="polite">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
