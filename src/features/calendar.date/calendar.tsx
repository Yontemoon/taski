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
import { cn, formatDate } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { TTodos } from "@/types/tables.types";
import Loader from "@/components/loader";
import { TodoWrapperProvider } from "@/context/todo";
import DayWrapper from "./day-wrapper";
import TodoWrapper from "./todo-wrapper";

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
                  todos={todos}
                  key={day.toString()}
                  date={stringDate}
                  id="day-wrapper"
                  className={cn(
                    "p-2 transition-all duration-150 ease-linear hover:cursor-pointer text-sm overflow-hidden w-full grow border"
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

                  <DayWrapper>
                    {todos.map((todo) => {
                      return <TodoWrapper todo={todo} key={todo.id} />;
                    })}
                  </DayWrapper>
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
