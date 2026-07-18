import { useState } from "react";

import Button from "@components/shared/Button/Button";
import Modal from "@components/shared/Modal/Modal";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase.js";
import { Session, SessionBlockMeta } from "@/models/globalTypes";

type PaySessionModalProps = {
  session: Session;
  onClose: () => void;
};

const PaySessionModal = ({ session, onClose }: PaySessionModalProps) => {
  const { isDemo } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const meta = session.metadata as SessionBlockMeta | null;
  const isBlock = !!meta?.block_id;
  const pricePounds = (session.price_pence / 100).toFixed(2);

  const handlePay = async () => {
    if (isDemo) return;
    setIsLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-checkout-session", {
        body: { session_id: session.id },
      });

      if (fnError) throw new Error(fnError.message);
      if (!data?.url) throw new Error("No checkout URL returned");

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Pay for session"
      onClose={onClose}
      size="sm"
      actions={
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handlePay} disabled={isLoading || isDemo}>
            {isLoading ? "Redirecting…" : `Pay £${isBlock ? "block" : pricePounds}`}
          </Button>
        </div>
      }
    >
      <p style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
        {isBlock
          ? `You'll be taken to our secure payment page to pay for your full session block (£${pricePounds} per session).`
          : `You'll be taken to our secure payment page to pay £${pricePounds} for this session.`}
      </p>
      {import.meta.env.DEV && (
        <div
          style={{
            marginTop: "12px",
            padding: "10px 12px",
            borderRadius: "6px",
            background: "var(--bg-subtle, #f5f5f5)",
            border: "1px dashed var(--border)",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ display: "block", marginBottom: "4px" }}>Test mode</strong>
          Card: <code>4242 4242 4242 4242</code> · Expiry: <code>12/30</code> · CVC: <code>123</code>
        </div>
      )}
      {error && <p style={{ fontSize: "0.85rem", color: "var(--error)", marginTop: "8px" }}>{error}</p>}
    </Modal>
  );
};

export default PaySessionModal;
