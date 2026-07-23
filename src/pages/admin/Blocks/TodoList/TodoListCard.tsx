import { useState } from "react";

import dayjs, { Dayjs } from "dayjs";

import { RootState } from "@/store";

import { Button, Card, Modal } from "@/components/shared";
import { ModalProps } from "@/components/shared/Modal/Modal";
import { useToast } from "@/context/ToastContext";
import { useAppSelector, useFetchOnIdle, useAppDispatch } from "@/store/hooks";
import { fetchAllTodos, createTodoItem } from "@/store/slices/TodoSlice";
import TodoList from "./TodoList";

import styles from "./TodoListCard.module.scss";

const TodoListCard = () => {
  const [newTodoModal, setNewTodoModal] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoDate, setNewTodoDate] = useState<Dayjs | null>(null);
  const [newTodoPriority, setNewTodoPriority] = useState<1 | 2 | 3>(2);
  const [loading, setIsLoading] = useState(false);
  const [isCreateMultiple, setIsCreateMultiple] = useState(false);

  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  useFetchOnIdle(
    (state: RootState) => state.todos.status,
    () => fetchAllTodos(),
    "Failed to fetch todo items",
  );

  const todos = useAppSelector((state: RootState) => state.todos.todos);

  const resetAllButModal = () => {
    setNewTodoDate(null);
    setNewTodoText("");
    setNewTodoPriority(2);
    setIsLoading(false);
  };

  const handleCancel = () => {
    resetAllButModal();
    setNewTodoModal(false);
  };
  resetAllButModal;

  const handleCreate = async () => {
    if (!newTodoText) {
      showToast("Your new task is missing text", "warning");
      return;
    }
    setIsLoading(true);
    //!if successful
    const submissionInformation = {
      deadline: newTodoDate ? newTodoDate.toISOString() : null,
      text: newTodoText,
      priority: newTodoPriority,
    };
    try {
      await dispatch(createTodoItem(submissionInformation));
      showToast("Task created", "success");
      resetAllButModal();
      if (!isCreateMultiple) {
        setNewTodoModal(false);
      }
    } catch (error) {
      showToast((error.message as string) || "Somthing went wrong, please reload and try again", "danger");
    }
    // resetAllButModal();
    setIsLoading(false);
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
          <Button onClick={handleCancel} variant="ghost" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating" : "Create"}
          </Button>
        </div>
      </div>
    ),
  };

  return (
    <>
      <Card>
        <div className={styles.cardPad}>
          <div className={styles.cardHeader}>
            <h2>Todo list</h2>
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
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="todoPriority">Priority</label>
              <select
                id="todoPriority"
                value={newTodoPriority}
                onChange={(e) => setNewTodoPriority(Number(e.target.value) as 1 | 2 | 3)}
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
