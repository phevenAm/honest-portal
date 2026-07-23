import { useState } from "react";

import { RootState } from "@/store";

import { Button, Card } from "@/components/shared";
import { useAppSelector, useFetchOnIdle } from "@/store/hooks";
import { fetchAllTodos } from "@/store/slices/TodoSlice";
import TodoList from "./TodoList";
import TodoListModal from "./TodoListModal/TodoListModal";

import styles from "./TodoListCard.module.scss";

const TodoListCard = () => {
  const [modalOpen, setModalOpen] = useState(false);

  useFetchOnIdle(
    (state: RootState) => state.todos.status,
    () => fetchAllTodos(),
    "Failed to fetch todo items",
  );

  const todos = useAppSelector((state: RootState) => state.todos.todos);

  return (
    <>
      <Card>
        <div className={styles.cardPad}>
          <div className={styles.cardHeader}>
            <h2>Todo list</h2>
            <div className={styles.CreateTodo}>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(true)}>
                + Todo
              </Button>
            </div>
          </div>
          <div className={styles.actionList}>
            <TodoList todos={todos} />
          </div>
        </div>
      </Card>

      {modalOpen && <TodoListModal onClose={() => setModalOpen(false)} />}
    </>
  );
};

export default TodoListCard;
