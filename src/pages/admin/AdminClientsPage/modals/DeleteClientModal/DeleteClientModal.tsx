import React from "react";

import Modal from "../../../../../components/shared/Modal/Modal";
import Button from "../../../../../components/shared/Button/Button";
import { deleteUser } from "../../../../../store/slices/userDirectorySlice";
import { useAppDispatch } from "../../../../../store/hooks";

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

  console.log('id from modal is: ', id);

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
          <Button
            variant="primary"
            onClick={onClose}
            aria-label="cancel user deletion"
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={handleConfirm}
            aria-label="confirm user deletion"
          >
            Delete
          </Button>
        </>
      }
    >
      <p>{bodyText}</p>
    </Modal>
  );
}