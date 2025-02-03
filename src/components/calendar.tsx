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
import { Button } from "./ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

type PropTypes = {
  current: Date;
};

export default function Calendar({ current }: PropTypes) {
  const startMonth = startOfMonth(current);
  const endMonth = endOfMonth(current);
  const startCalendar = startOfWeek(startMonth);
  const endCalendar = endOfWeek(endMonth);

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
      <div className="grid grid-cols-7 text-center font-semibold text-gray-600 w-full">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 text-center w-full h-screen">
        {days.map((day, index) => (
          <div
            key={index}
            onClick={(_e) => {
              console.log(day);
            }}
            className={cn(
              "p-4 rounded-lg transition-all  duration-150 ease-linear hover:cursor-pointer",
              isToday(day) ? "bg-ring text-background font-bold" : "bg-muted"
              //   day.getMonth() !== currentMonth.getMonth() && "opacity-50"
            )}
          >
            {format(day, "d")}
          </div>
        ))}
      </div>
    </div>
  );
}
