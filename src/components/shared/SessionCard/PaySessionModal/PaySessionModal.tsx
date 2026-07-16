import Button from "@components/shared/Button/Button";
import Modal from "@components/shared/Modal/Modal";

import { useCounsellorName } from "@/Hooks/useCounsellorName";
import { Session } from "@/models/globalTypes";

type PaySessionModalProps = {
  session: Session;
  onClose: () => void;
};

const PaySessionModal = ({ session, onClose }: PaySessionModalProps) => {
  const counsellorName = useCounsellorName();

  return (
    <Modal
      title="Pay for session"
      onClose={onClose}
      size="sm"
      actions={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <p style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
        Online payments are coming soon. In the meantime, please contact {counsellorName} directly to arrange payment.
      </p>
      {/* TODO: Stripe integration */}
    </Modal>
  );
};

export default PaySessionModal;
