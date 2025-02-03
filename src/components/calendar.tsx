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
import { useNavigate } from "@tanstack/react-router";

type PropTypes = {
  current: Date;
};

export default function Calendar({ current }: PropTypes) {
  const navigate = useNavigate({ from: "/calendar/$date" });

  console.log(new Date());

  const startMonth = startOfMonth(current);
  const endMonth = endOfMonth(current);
  const startCalendar = startOfWeek(startMonth);
  const endCalendar = endOfWeek(endMonth);

  const days = eachDayOfInterval({ start: startCalendar, end: endCalendar });

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-4 w-full">
      <div className="flex justify-between items-center mb-4 w-full">
        <button
          onClick={() => {
            navigate({
              to: "/calendar/$date",
              params: { date: formatDate(subMonths(current, 1), "PARTIAL") },
            });
          }}
          className="text-gray-600 hover:text-black p-2"
        >
          ◀
        </button>
        <h2 className="text-xl font-semibold">
          {format(current, "MMMM yyyy")}
        </h2>
        <button
          onClick={() => {
            navigate({
              to: "/calendar/$date",
              params: { date: formatDate(addMonths(current, 1), "PARTIAL") },
            });
          }}
          className="text-gray-600 hover:text-black p-2"
        >
          ▶
        </button>
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
        {days.map((day) => (
          <div
            key={day.toString()}
            className={cn(
              "p-4 rounded-lg transition-all",
              isToday(day) ? "bg-blue-500 text-white font-bold" : "bg-gray-200"
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
