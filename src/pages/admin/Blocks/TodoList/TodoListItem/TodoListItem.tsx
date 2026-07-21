import { BinIcon, EditIcon, IconButton, TickIcon } from "@/components/shared";
import type { Todo } from "@/models/globalTypes";

import styles from "./TodoListItem.module.scss";

const PRIORITY_LABELS: Record<number, string> = { 1: "High", 2: "Med", 3: "Low" };
const PRIORITY_CLASSES: Record<number, string> = { 1: styles.p1, 2: styles.p2, 3: styles.p3 };

const TodoListItem = (todo: Todo) => {
  const { completed, text, priority, deadline } = todo;
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
          <IconButton variant="danger" label="Delete item" icon={<BinIcon />} />
        </div>
      </div>
    </div>
  );
};

export default TodoListItem;
