import {
  endOfYear,
  startOfYear,
  getYear,
  eachDayOfInterval,
  isToday,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { formatDate } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Link, useRouteContext } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  tagsAllQueryOptions,
  todosByCreatedAtOptions,
  todosByTagOptions,
} from "@/lib/options";
import { themeButtonVariants } from "@/lib/themes";
import { TColorTypes } from "@/types/color.types";

type PropTypes = {
  tag?: string | undefined;
};

const YearGrid = ({ tag }: PropTypes) => {
  const start = startOfYear(new Date());
  const end = endOfYear(new Date());
  const startWeek = startOfWeek(start);
  const endWeek = endOfWeek(end);
  const days = eachDayOfInterval({ start: startWeek, end: endWeek });
  const displayedYear = getYear(new Date());
  const { auth } = useRouteContext({ from: "/_authed/home" });
  const { data: tagData } = useSuspenseQuery(
    tagsAllQueryOptions(auth?.user?.id!)
  );
  const { data } = useSuspenseQuery(
    tag ? todosByTagOptions(tag, 2025) : todosByCreatedAtOptions(2025)
  );
  const foundTags = tag
    ? tagData?.find((currTag) => currTag.name === tag)
    : undefined;
  return (
    <div className="">
      <h1>
        <span>{tag}</span> <span>{displayedYear}</span>
      </h1>
      <div className="flex">
        <div className="grid grid-rows-7 grid-flow-col gap-0.5 justify-center text-center ml-2 mr-1">
          <p>SUN</p>
          <p>MON</p>
          <p>TUES</p>
          <p>WED</p>
          <p>THUR</p>
          <p>FRI</p>
          <p>SAT</p>
        </div>
        {data && (
          <div className="grid grid-rows-7 grid-flow-col gap-0.5 items-center">
            {days.map((day, index) => {
              const dateString = formatDate(day);
              const dateCount = data[dateString];
              // const
              return (
                <DaySquare
                  date={day}
                  key={index}
                  count={dateCount}
                  displayedYear={displayedYear}
                  color={foundTags?.color as TColorTypes | undefined}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const DaySquare = ({
  date,
  count,
  displayedYear,
  color,
}: {
  date: Date;
  count: { count: number } | undefined;
  displayedYear: number;
  color: TColorTypes | undefined;
}) => {
  const today = isToday(date);
  const year = getYear(date);
  const colorFill = color ? themeButtonVariants[color] : "bg-black/50";
  const isDisplayed = year === displayedYear;
  if (isDisplayed) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Link to="/todo/$id" params={{ id: formatDate(date) }}>
            <div
              className={cn(
                "border border-foreground w-4 h-4 rounded-sm hover:bg-foreground duration-150 transition-all ease-in-out",
                count && `${colorFill}`,
                today && `bg-gray-600`
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
  } else {
    return <span className="" />;
  }
};

export default YearGrid;
