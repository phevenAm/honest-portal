import dayjs from "dayjs";

import Button from "@components/shared/Button/Button";
import Modal from "@components/shared/Modal/Modal";

import { useToast } from "@/context/ToastContext";
import { Session } from "@/models/globalTypes";
import { useAppDispatch } from "@/store/hooks";
import { updateSession } from "@/store/slices/sessionsSlice";

type CancelSessionModalProps = {
  session: Session;
  onClose: () => void;
};

const CancelSessionModal = ({ session, onClose }: CancelSessionModalProps) => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const handleCancel = async () => {
    try {
      await dispatch(updateSession({ id: session.id, status: "cancelled" })).unwrap();
      showToast("Session cancelled.", "success");
      onClose();
      // ! how can i automate refund or at elast flag on admin page that the client has cancelled and they need a refund. provided its within the wingow? maybe the modal should say that if its within 48 hours of the session start, no refund, otherwise they will be refuned

      // admin will need an ElementInternals, and a marker on the users page that hte need to refund X. so maybe i might have to create a bell icons for notifications? these notifications will bascailly be the emails that will also be sent but can be seen in app?

      // i dont know if i can offer redunces and stuff throught eh app, i dont know how somethin glike strip works
    } catch (error: any) {
      showToast(error?.message ?? "Failed to cancel session.", "danger");
    }
  };

  return (
    <Modal
      title="Cancel session?"
      onClose={onClose}
      size="sm"
      actions={
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="danger" onClick={handleCancel}>
            Yes, cancel it
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Keep it
          </Button>
        </div>
      }
    >
      <p>Cancel your session on {dayjs(session.scheduled_at).format("dddd D MMM [at] h:mma")}?</p>
    </Modal>
  );
};

export default CancelSessionModal;
