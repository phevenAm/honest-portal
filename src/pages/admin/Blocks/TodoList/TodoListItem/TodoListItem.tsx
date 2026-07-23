import { BinIcon, EditIcon, IconButton, TickIcon } from "@/components/shared";
import type { Todo } from "@/models/globalTypes";

import styles from "./TodoListItem.module.scss";
import { deleteTodoItem } from "@/store/slices/TodoSlice";
import { useAppDispatch } from "@/store/hooks";
import { useToast } from "@/context/ToastContext";
import { useState } from "react";

const PRIORITY_LABELS: Record<number, string> = { 1: "High", 2: "Med", 3: "Low" };
const PRIORITY_CLASSES: Record<number, string> = { 1: styles.p1, 2: styles.p2, 3: styles.p3 };

const TodoListItem = (todo: Todo) => {
  const { completed, text, priority, deadline, id } = todo;
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const handleDeleteTodo = async (id: string) => {
    setIsDeleting(true);
    try {
      await dispatch(deleteTodoItem(id)).unwrap();
      showToast("Task deleted", "success");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete, please reload page and try again";
      showToast(message, "danger");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`${styles.container} ${completed ? styles.completed : ""}`}>
      <div className={styles.header}>
        <span className={`${styles.priority} ${PRIORITY_CLASSES[priority]}`}>{PRIORITY_LABELS[priority]}</span>
        <p aria-label={text}>{text}</p>
      </div>

      <div>
        <div className={styles.meta}>
          {deadline && new Date(deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </div>
        <div className={styles.actions}>
          <IconButton label="Mark as completed" icon={<TickIcon />} />
          <IconButton label="Edit item" icon={<EditIcon />} />
          <IconButton
            variant="danger"
            label="Delete item"
            disabled={isDeleting}
            icon={isDeleting ? <>...</> : <BinIcon />}
            onClick={() => {
              handleDeleteTodo(id);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TodoListItem;
