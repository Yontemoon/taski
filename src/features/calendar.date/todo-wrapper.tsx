import React from "react";
import DialogEditTodo from "@/components/dialog/edit-todo";
import { DialogProvider } from "@/context/dialog";
import { useInView } from "react-intersection-observer";
import { TTodos } from "@/types/tables.types";
import TodoLine from "./todo-line";
import { useTodo } from "@/context/todo";
import { cn } from "@/lib/utils";

const TodoWrapper = ({ todo }: { todo: TTodos }) => {
  const { decrease, increase } = useTodo();

  const { ref, inView } = useInView({
    threshold: 1,
  });

  React.useEffect(() => {
    if (inView) {
      decrease();
    } else {
      increase();
    }
  }, [inView]);

  return (
    <DialogProvider DialogComponent={<DialogEditTodo todo={todo} />}>
      <span ref={ref}>
        <TodoLine
          className={cn(inView ? "inline-flex " : "invisible")}
          todo={todo}
        />
      </span>
    </DialogProvider>
  );
};

export default TodoWrapper;
