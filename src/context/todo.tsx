import React from "react";
import { cn } from "@/lib/utils";

const TodoContext = React.createContext<{
  set: (number: number) => void;
  increase: () => void;
  decrease: () => void;
} | null>(null);

type TodoProviderProps = {
  children: React.ReactNode;
  className: string;
} & React.ComponentProps<"div">;

const TodoWrapperProvider = ({
  children,
  className,
  ...props
}: TodoProviderProps) => {
  const [numberTodos, setNumberTodos] = React.useState<number>(0);
  // const dayRef = React.useRef<HTMLDivElement>(null!);

  const set = React.useCallback((number: number) => {
    setNumberTodos(number);
  }, []);

  const increase = () => {
    setNumberTodos(numberTodos + 1);
  };

  const decrease = () => {
    setNumberTodos(numberTodos - 1);
  };

  return (
    <TodoContext.Provider value={{ set, increase, decrease }}>
      <div {...props} className={cn("relative ", className)}>
        {children}
        {numberTodos > 0 && (
          <div className="absolute bottom-0 left-0 z-20 bg-foreground w-full text-background rounded-sm p-1 text-center">
            <p>{numberTodos}</p>
          </div>
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
