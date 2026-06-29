import React, { useState } from "react";

import Button from "@components/shared/Button/Button";
import Modal from "@components/shared/Modal/Modal";
import { useAuth } from "@context/AuthContext";
import { useAppDispatch } from "@store/hooks";
import { deleteOwnAccount } from "@store/slices/userDirectorySlice";

type DeleteUserModalProps = {
  onClose: () => void;
};

export default function DeleteUserModal({ onClose }: DeleteUserModalProps) {
  const dispatch = useAppDispatch();
  const { signOut, userProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleDeletion = async () => {
    try {
      await dispatch(deleteOwnAccount(userProfile?.id ?? "")).unwrap();
      await signOut();
    } catch (err) {
      console.error("Failed to delete user", err);
      setError("Something went wrong. Please try again.");
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
      {error && <p style={{ color: "var(--error)", marginTop: "0.5rem" }}>{error}</p>}
    </Modal>
  );
}
