import React from "react";

import Button from "../../../../../components/shared/Button/Button";
import Modal from "../../../../../components/shared/Modal/Modal";
import { useAppDispatch } from "../../../../../store/hooks";
import { deleteUser } from "../../../../../store/slices/userDirectorySlice";

type DeleteClientModalProps = {
  onClose: () => void;
  bodyText: React.ReactNode;
  modalTitle?: string;
  id: string;
};

export default function DeleteClientModal({
  onClose,
  id,
  bodyText,
  modalTitle = "Delete user",
}: DeleteClientModalProps) {
  const dispatch = useAppDispatch();

  const handleConfirm = async () => {
    await dispatch(deleteUser(id)).unwrap();
    onClose();
  };

  return (
    <Modal
      title={modalTitle}
      onClose={onClose}
      actions={
        <>
          <Button variant="primary" onClick={onClose} aria-label="cancel user deletion">
            Cancel
          </Button>

          <Button variant="danger" onClick={handleConfirm} aria-label="confirm user deletion">
            Delete
          </Button>
        </>
      }
    >
      <p>{bodyText}</p>
    </Modal>
  );
}
