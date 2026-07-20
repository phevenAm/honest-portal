import { Card, Button } from "@/components/shared";

import { useAppSelector, useFetchOnIdle } from "@/store/hooks";
import { fetchAllTodos } from "@/store/slices/TodoSlice";
import TodoList from "./TodoList";
import { RootState } from "@/store";
import styles from "./TodoListCard.module.scss";

const TodoListCard = () => {
  useFetchOnIdle(
    (state: RootState) => state.todos.status,
    () => fetchAllTodos(),
    "Failed to fetch todo items",
  );
  const todos = useAppSelector((state: RootState) => state.todos.todos);

  return (
    <Card>
      <div className={styles.cardPad}>
        <div className={styles.cardHeader}>
          <h3>Todo list</h3>
          <div className={styles.CreateTodo}>
            <Button variant="ghost" size="sm">
              + Todo
            </Button>
          </div>
        </div>
        <div className={styles.actionList}>
          <TodoList todos={todos} />
        </div>
      </div>
    </Card>
  );
};

export default TodoListCard;
