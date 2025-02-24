import React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { cn, extractHashtag, formatDate, getColor } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useRouteContext } from "@tanstack/react-router";
import { TAllTags, TTodos } from "@/types/tables.types";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { DialogProvider } from "@/context/dialog";
import DialogEditTodo from "./dialog/edit-todo";
import Loader from "./loader";
import { useInView } from "react-intersection-observer";
import { TodoWrapperProvider, useTodo } from "@/context/todo";

type PropTypes = {
  current: Date;
  data:
    | {
        [k: string]: TTodos[];
      }
    | undefined;
};

export default function Calendar({ current, data }: PropTypes) {
  const startMonth = startOfMonth(current);
  const endMonth = endOfMonth(current);
  const startCalendar = startOfWeek(startMonth);
  const endCalendar = endOfWeek(endMonth);
  const days = eachDayOfInterval({ start: startCalendar, end: endCalendar });

  return (
    <div className="self-stretch w-full">
      <div className="flex flex-col p-5 self-stretch h-dvh">
        <div className="flex justify-between items-center w-full">
          <Link
            preload={"viewport"}
            to="/calendar/$date"
            params={{ date: formatDate(subMonths(current, 1), "PARTIAL") }}
          >
            <Button variant={"secondary"}>
              <ChevronLeft />
            </Button>
          </Link>
          <h2 className="text-xl font-semibold">
            {format(current, "MMMM yyyy")}
          </h2>
          <Link
            preload={"viewport"}
            to="/calendar/$date"
            params={{ date: formatDate(addMonths(current, 1), "PARTIAL") }}
          >
            <Button variant={"secondary"}>
              <ChevronRight />
            </Button>
          </Link>
        </div>

        {/* Days of the Week */}
        <div className="grid grid-cols-7 text-center auto-rows-fr  font-semibold text-gray-600 w-full ">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-0.5">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        {data ? (
          <div className="grid grid-cols-7 auto-rows-fr auto-cols-fr w-full flex-grow min-h-0 ">
            {days.map((day) => {
              const stringDate = formatDate(day);
              const todos = (data && data[stringDate]) || [];
              return (
                <TodoWrapperProvider
                  key={day.toString()}
                  id="todo-wrapper"
                  onClick={(_e) => {
                    console.log(day);
                  }}
                  className={cn(
                    "p-1 transition-all duration-150 ease-linear hover:cursor-pointer text-sm overflow-hidden w-full grow border"
                  )}
                >
                  <div className="flex justify-center">
                    <Link
                      to="/todo/$id"
                      params={() => {
                        const formattedDate = formatDate(day);
                        return {
                          id: formattedDate,
                        };
                      }}
                    >
                      <p
                        className={cn(
                          "hover:underline rounded-full w-10 text-center box-border mb-1",
                          isToday(day) && "bg-foreground/90 text-background"
                        )}
                      >
                        {format(day, "d")}
                      </p>
                    </Link>
                  </div>
                  <div className="gap-y-1 flex flex-col overflow-hidden ">
                    {todos.map((todo) => {
                      return <TodoLine todo={todo} key={todo.id} />;
                    })}
                  </div>
                </TodoWrapperProvider>
              );
            })}
          </div>
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
}

const TodoLine = ({ todo }: { todo: TTodos }) => {
  const context = useRouteContext({ from: "/_authed/calendar/$date" });
  const { numberTodos, setNumberTodos } = useTodo();

  const tags = extractHashtag(todo.todo).map((tag) => tag.slice(1));
  const [show, setShow] = React.useState(true);
  const isComplete = todo.status;
  const todoArray = todo.todo.trim().split(" ");
  const newSentence = todoArray.filter((word) => word[0] !== "#");
  const allTags = context.queryClient.getQueryData([
    "tags",
    context.auth.user?.id,
  ]) as TAllTags[];

  const { ref: inViewRef } = useInView({
    threshold: 1,
    onChange(inView) {
      setShow(inView);

      if (!inView) {
        setNumberTodos(numberTodos + 1);
      } else {
        setNumberTodos(numberTodos - 1);
      }
    },
  });

  React.useEffect(() => {
    if (show) {
      setNumberTodos(numberTodos - 1);
    } else {
      setNumberTodos(numberTodos + 1);
    }
  }, []);

  return (
    <DialogProvider
      DialogComponent={<DialogEditTodo todo={todo} />}
      key={todo.id}
    >
      {
        <div
          ref={inViewRef}
          id="todo"
          className={cn(
            "bg-foreground/5 rounded-md line-clamp-1 truncate p-0.5 gap-1 flex",
            show ? "flex" : "invisible"
          )}
          key={todo.id}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {tags.map((tag) => {
            const tagColorNumber = allTags.find((aTag) => aTag.name === tag)
              ?.color as number;

            const themeCN = getColor(tagColorNumber);
            return (
              <HoverCard key={tag} openDelay={3}>
                <HoverCardTrigger>
                  <div
                    className={cn(
                      themeCN,
                      "h-4 w-4",
                      !isComplete && "bg-background"
                    )}
                  />
                </HoverCardTrigger>
                <HoverCardContent>{tag}</HoverCardContent>
              </HoverCard>
            );
          })}
          <span className={cn(todo.status && "line-through")}>
            {newSentence.join(" ")}
          </span>
        </div>
      }
    </DialogProvider>
  );
};
