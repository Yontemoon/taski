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
                  id="day-wrapper"
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
                  <div className="gap-y-1 flex flex-col overflow-hidden">
                    <DayWrapper>
                      {todos.map((todo) => {
                        return <TodoLine todo={todo} key={todo.id} />;
                      })}
                    </DayWrapper>
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

const DayWrapper = ({
  children,
}: { children: React.ReactNode } & React.ComponentProps<"div">) => {
  const { set } = useTodo();
  const ref = React.useRef<HTMLDivElement>(null);

  // console.log("passing here");
  React.useEffect(() => {
    let initInvis = 0;
    console.log(ref.current?.childNodes);
    ref.current?.childNodes.forEach((node) => {
      const child = node.firstChild as HTMLDivElement;
      if (child && child.className.includes("invisible")) {
        initInvis++;
      }
    });
    console.log(initInvis);
    set(initInvis);
  }, []);

  return <div ref={ref}>{children}</div>;
};

const TodoLine = ({ todo }: { todo: TTodos }) => {
  const context = useRouteContext({ from: "/_authed/calendar/$date" });
  const { decrease, increase } = useTodo();

  const tags = extractHashtag(todo.todo).map((tag) => tag.slice(1));
  const isComplete = todo.status;
  const todoArray = todo.todo.trim().split(" ");
  const newSentence = todoArray.filter((word) => word[0] !== "#");
  const allTags = context.queryClient.getQueryData([
    "tags",
    context.auth.user?.id,
  ]) as TAllTags[];

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
    <div ref={ref}>
      <DialogProvider DialogComponent={<DialogEditTodo todo={todo} />}>
        <div
          hidden={inView}
          id="todo"
          className={cn(
            "bg-foreground/5 rounded-md line-clamp-1 truncate p-0.5 gap-1  w-full",
            inView ? "inline-flex " : "invisible"
          )}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <>
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
          </>
        </div>
      </DialogProvider>
    </div>
  );
};
