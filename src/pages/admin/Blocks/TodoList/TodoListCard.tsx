import { Card, Button, Modal } from "@/components/shared";
import { useState, useEffect } from "react";

import { useAppSelector, useFetchOnIdle } from "@/store/hooks";
import { fetchAllTodos } from "@/store/slices/TodoSlice";
import TodoList from "./TodoList";
import { RootState } from "@/store";
import styles from "./TodoListCard.module.scss";
import { ModalProps } from "@/components/shared/Modal/Modal";
import dayjs, { Dayjs } from "dayjs";
import { useToast } from "@/context/ToastContext";
import { create } from "node_modules/@mui/material/styles/createTransitions.mjs";

const TodoListCard = () => {
  const [newTodoModal, setNewTodoModal] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoDate, setNewTodoDate] = useState<Dayjs | null>(null);
  const [newTodoPriority, setNewTodoPriority] = useState<1 | 2 | 3>(2);
  const [loading, setIsLoading] = useState(false);
  const [isCreateMultiple, setIsCreateMultiple] = useState(false);

  const { showToast } = useToast();

  useFetchOnIdle(
    (state: RootState) => state.todos.status,
    () => fetchAllTodos(),
    "Failed to fetch todo items",
  );
  const todos = useAppSelector((state: RootState) => state.todos.todos);

  const resetAllButModal = () => {
    setNewTodoDate(null);
    setNewTodoText("");
    setNewTodoPriority(0);
    setIsLoading(false);
  };

  const handleCancel = () => {
    resetAllButModal();
    setNewTodoModal(false);
  };
  resetAllButModal;

  const handleCreate = () => {
    //!if successful
    showToast("Task created", "success");
    resetAllButModal();

    if (!isCreateMultiple) {
      setNewTodoModal(false);
    }
  };

  const modalObj: ModalProps = {
    title: "New task",
    onClose: () => setNewTodoModal(false),
    actions: (
      <div className={styles.actionContainer}>
        <div className={styles.checkContainer}>
          <label htmlFor="createMultiple">Create another task</label>
          <input
            type="checkbox"
            name=""
            id="createMultiple"
            checked={isCreateMultiple}
            onClick={() => {
              setIsCreateMultiple(!isCreateMultiple);
            }}
          />
        </div>

        <div className={styles.buttons}>
          <Button onClick={handleCancel} variant="ghost">
            Cancel
          </Button>
          <Button onClick={handleCreate}>{loading ? "Creating" : "Create"}</Button>
        </div>
      </div>
    ),
  };

  return (
    <>
      <Card>
        <div className={styles.cardPad}>
          <div className={styles.cardHeader}>
            <h3>Todo list</h3>
            <div className={styles.CreateTodo}>
              <Button variant="ghost" size="sm" onClick={() => setNewTodoModal(true)}>
                + Todo
              </Button>
            </div>
          </div>
          <div className={styles.listBlock}>
            <div className={styles.actionList}>
              <TodoList todos={todos} />
            </div>
          </div>
        </div>
      </Card>

      {newTodoModal && (
        <Modal {...modalObj}>
          <div className={styles.newItem}>
            <div className={styles.field}>
              <label htmlFor="todoText">Task</label>
              <input
                id="todoText"
                type="text"
                placeholder="What needs doing?"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="todoPriority">Priority</label>
              <select
                id="todoPriority"
                value={newTodoPriority}
                onChange={(e) => setNewTodoPriority(Number(e.target.value))}
              >
                <option value={1}>High</option>
                <option value={2}>Medium</option>
                <option value={3}>Low</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="todoDate">Deadline (optional)</label>
              <input
                id="todoDate"
                type="date"
                value={newTodoDate?.format("YYYY-MM-DD") ?? ""}
                onChange={(e) => setNewTodoDate(e.target.value ? dayjs(e.target.value) : null)}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default TodoListCard;
