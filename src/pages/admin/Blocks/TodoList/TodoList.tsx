import type { Todo } from "@/models/globalTypes";
import TodoListItem from "./TodoListItem/TodoListItem";

import styles from "./TodoList.module.scss";

const TodoList = ({ todos }: { todos: Todo[] }) => {
  return todos.length > 0 ? (
    <div className={styles.list}>
      {todos.map((item) => (
        <TodoListItem key={item.id} {...item} />
      ))}
    </div>
  ) : (
    <p className={styles.empty}>No items yet</p>
  );
};

export default TodoList;
