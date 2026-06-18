import React from "react";

import { useAppDispatch } from "@store/hooks";
import { deleteUser } from "@store/slices/userDirectorySlice";
import { useAuth } from "@context/AuthContext";
import Modal from "@components/shared/Modal/Modal";
import Button from "@components/shared/Button/Button";

type DelteUserModalProps = {
  onClose: () => void;
  // bodyText: React.ReactNode;
  // modalTitle: string;
  // idToDelete: string;
};

export default function DeleteUserModal({ onClose }: DelteUserModalProps) {
  const dispatch = useAppDispatch();
  const { signOut, userProfile } = useAuth();

  const handleDeletion = async () => {
    try {
      await dispatch(deleteUser(userProfile?.id ?? "")).unwrap();
      await signOut();
    } catch (error) {
      console.error("Failed to delete user", error);
      // deletion failed — stay on page, user still exists
      onClose();
    }
  };

  return (
    <Modal
      title="Delete your account forever?"
      onClose={onClose}
      actions={
        <>
          <Button variant="primary" onClick={onClose} aria-label="cancel user deletion">
            Cancel
          </Button>

          <Button variant="danger" onClick={handleDeletion} aria-label="confirm user deletion">
            Delete
          </Button>
        </>
      }
    >
      <p>Are you sure you want to delete your account? This action cannot be undone.</p>
    </Modal>
  );
}
