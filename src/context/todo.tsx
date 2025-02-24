import React from "react";
import { cn } from "@/lib/utils";

const TodoContext = React.createContext<{
  setNumberTodos: React.Dispatch<React.SetStateAction<number>>;
  numberTodos: number;
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

  return (
    <TodoContext.Provider value={{ setNumberTodos, numberTodos }}>
      <div {...props} className={cn("relative", className)}>
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
