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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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
    <div className="flex flex-col p-2 w-full h-dvh">
      <div className="flex justify-between items-center w-full p-4">
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
          <div key={day} className="p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 auto-rows-fr auto-cols-fr gap-1  w-full flex-grow min-h-0">
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
                "p-1 rounded-lg transition-all duration-150 ease-linear hover:cursor-pointer text-xs overflow-hidden w-full",
                isToday(day) ? "bg-muted/80" : "bg-muted"

                //   day.getMonth() !== currentMonth.getMonth() && "opacity-50"
              )}
            >
              <Link
                to="/todo/$id"
                params={() => {
                  const formattedDate = formatDate(day);
                  return {
                    id: formattedDate,
                  };
                }}
              >
                <p className="text-center hover:underline">
                  {format(day, "d")}
                </p>
              </Link>
              <div className="gap-y-1 flex flex-col overflow-hidden ">
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
                      className="bg-background rounded-md line-clamp-1 truncate p-0.5 flex gap-1 overflow-hidden"
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
                          <HoverCard key={tag} openDelay={3}>
                            <HoverCardTrigger>
                              <div className={cn(themeCN, "h-4 w-4")} />
                            </HoverCardTrigger>
                            <HoverCardContent>{tag}</HoverCardContent>
                          </HoverCard>
                        );
                      })}
                      <span className={cn(todo.status && "line-through")}>
                        {newSentence.join(" ")}
                      </span>
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
