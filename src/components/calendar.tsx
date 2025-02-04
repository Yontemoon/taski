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
import { TAllTags } from "@/types/tables.types";

type PropTypes = {
  current: Date;
  data:
    | {
        [k: string]: {
          created_at: string | null;
          date_set: string;
          id: number;
          status: boolean;
          todo: string;
          updated_at: string | null;
          user_id: string;
        }[];
      }
    | undefined;
};

export default function Calendar({ current, data }: PropTypes) {
  const startMonth = startOfMonth(current);
  const endMonth = endOfMonth(current);
  const startCalendar = startOfWeek(startMonth);
  const endCalendar = endOfWeek(endMonth);

  const context = useRouteContext({ from: "/_authed/calendar/$date" });

  const days = eachDayOfInterval({ start: startCalendar, end: endCalendar });

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 w-full">
      <div className="flex justify-between items-center mb-4 w-full">
        <Button
          asChild
          variant={"secondary"}
          className="text-gray-600 hover:text-black p-2"
        >
          <Link
            to="/calendar/$date"
            params={{ date: formatDate(subMonths(current, 1), "PARTIAL") }}
          >
            <ChevronLeft />
          </Link>
        </Button>
        <h2 className="text-xl font-semibold">
          {format(current, "MMMM yyyy")}
        </h2>
        <Button
          variant={"secondary"}
          asChild
          className="text-gray-600 hover:text-foreground p-2"
        >
          <Link
            to="/calendar/$date"
            params={{ date: formatDate(addMonths(current, 1), "PARTIAL") }}
          >
            <ChevronRight />
          </Link>
        </Button>
      </div>

      {/* Days of the Week */}
      <div className="grid grid-cols-7 text-center font-semibold text-gray-600 w-full min-w-[900px]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 w-full h-screen min-w-[900px]">
        {days.map((day, index) => {
          const stringDate = formatDate(day);
          const todos = (data && data[stringDate]) || [];
          return (
            <div
              key={index}
              onClick={(_e) => {
                console.log(day);
              }}
              className={cn(
                "p-4 rounded-lg transition-all  duration-150 ease-linear hover:cursor-pointer h-56 text-xs w-full min-w-0 ",
                isToday(day) ? "bg-ring " : "bg-muted"
                //   day.getMonth() !== currentMonth.getMonth() && "opacity-50"
              )}
            >
              <p className="text-center">{format(day, "d")}</p>
              <div className="gap-y-1 flex flex-col overflow-hidden">
                {todos.map((todo) => {
                  const tags = extractHashtag(todo.todo).map((tag) =>
                    tag.slice(1)
                  );
                  const todoArray = todo.todo.trim().split(" ");
                  const newSentence = todoArray.filter(
                    (word) => word[0] !== "#"
                  );
                  const allTags = context.queryClient.getQueryData([
                    "tags",
                    context.auth.user?.id,
                  ]) as TAllTags[];

                  return (
                    <div
                      className="bg-background rounded-md line-clamp-1 truncate p-1 flex gap-1"
                      key={todo.id}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      {tags.map((tag) => {
                        const tagColorNumber = allTags.find(
                          (aTag) => aTag.name === tag
                        )?.color as number;

                        const themeCN = getColor(tagColorNumber);
                        return (
                          <div className={cn(themeCN, "h-4 w-4")} key={tag} />
                        );
                      })}
                      {newSentence.join(" ")}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
