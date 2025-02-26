import React from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TodoLine from "@/features/calendar.date/todo-line";
import { TTodos } from "@/types/tables.types";

const TodoContext = React.createContext<{
  set: (number: number) => void;
  increase: () => void;
  decrease: () => void;
} | null>(null);

type TodoProviderProps = {
  children: React.ReactNode;
  className: string;
  date: string;
  todos: TTodos[];
} & React.ComponentProps<"div">;

const TodoWrapperProvider = ({
  children,
  className,
  date,
  todos,
  ...props
}: TodoProviderProps) => {
  const [numberTodos, setNumberTodos] = React.useState<number>(0);

  const set = React.useCallback((number: number) => {
    setNumberTodos(number);
  }, []);

  const increase = React.useCallback(() => {
    setNumberTodos((prev) => prev + 1);
  }, []);

  const decrease = React.useCallback(() => {
    setNumberTodos((prev) => prev - 1);
  }, []);

  return (
    <TodoContext.Provider value={{ set, increase, decrease }}>
      <div {...props} className={cn("relative ", className)}>
        {children}
        {numberTodos > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <div className="absolute bottom-0 left-0 z-40 bg-foreground/5 rounded-md w-full text-foreground px-1 py-1 mx-1 text-xs hover:bg-foreground/10 ">
                {numberTodos} more
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <h1>{date}</h1>
              {todos.map((todo) => {
                return (
                  <TodoLine todo={todo} key={todo.id} className="inline-flex" />
                );
              })}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </TodoContext.Provider>
  );
};

const useTodo = () => {
  const todo = React.useContext(TodoContext);
  if (!todo) {
    throw new Error("useTodo must be within the context provider");
  }
  return todo;
};

export { useTodo, TodoWrapperProvider };
