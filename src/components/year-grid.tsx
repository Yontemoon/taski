// import React from "react";
import { endOfYear, startOfYear, getYear, eachDayOfInterval } from "date-fns";
import { formatDate } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type PropTypes = {
  data: { [k: string]: { count: number } };
};

const YearGrid = ({ data }: PropTypes) => {
  const start = startOfYear(new Date());
  const end = endOfYear(new Date());
  const days = eachDayOfInterval({ start, end });
  const year = getYear(new Date());

  return (
    <div className="max-w-sm w-full">
      <h1>{year}</h1>
      <div className="grid grid-rows-7 grid-flow-col gap-0.5 ">
        {days.map((day, index) => {
          const dateString = formatDate(day);
          const dateCount = data[dateString];
          return <DaySquare date={day} key={index} count={dateCount} />;
        })}
      </div>
    </div>
  );
};

const DaySquare = ({
  date,
  count,
}: {
  date: Date;
  count: { count: number } | undefined;
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link to="/todo/$id" params={{ id: formatDate(date) }}>
          <div
            className={cn(
              "border border-foreground w-4 h-4 rounded-sm hover:bg-foreground duration-150 transition-all ease-in-out",
              count && "bg-foreground/80"
            )}
          />
        </Link>
      </HoverCardTrigger>
      <HoverCardContent>
        <h1>{formatDate(date)}</h1>
        <h2>Count: {count?.count || 0}</h2>
      </HoverCardContent>
    </HoverCard>
  );
};

export default YearGrid;
