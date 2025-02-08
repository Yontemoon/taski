import { createFileRoute } from "@tanstack/react-router";
import Calendar from "@/components/calendar";
import { extractHashtag, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { tagsAllQueryOptions, todosByMonthQueryOptions } from "@/lib/options";
import { Link } from "@tanstack/react-router";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/_authed/calendar/$date")({
  component: RouteComponent,
  beforeLoad: ({ context, params }) => {
    const userId = context.auth.user?.id as string;
    const { date } = params;
    const dateFormat = formatDate(date, "PARTIAL");
    context.queryClient.prefetchQuery(tagsAllQueryOptions(userId));
    context.queryClient.prefetchQuery(todosByMonthQueryOptions(dateFormat));
  },
});

function RouteComponent() {
  const date = Route.useParams().date;
  const context = Route.useRouteContext();
  const [barData, setBarData] = React.useState<
    | {
        id: number;
        name: string;
        color: number;
        total: number;
        complete: number;
      }[]
  >();
  const dateFormat = formatDate(date, "PARTIAL");
  const { data, isPending } = useQuery(todosByMonthQueryOptions(dateFormat));
  const { data: tagsData, isPending: tagsLoading } = useQuery(
    tagsAllQueryOptions(context.auth.user?.id!)
  );

  React.useMemo(() => {
    if (data && tagsData) {
      const arrayData = tagsData.map((tag) => {
        const { id, name, color } = tag;
        return {
          id,
          name,
          color,
          total: 0,
          complete: 0,
        };
      });

      for (const [_key, values] of Object.entries(data)) {
        values.forEach((value) => {
          const isComplete = value.status;
          const tagsFound = extractHashtag(value.todo);
          const removedNumberSign = tagsFound.map((tag) => tag.slice(1));

          removedNumberSign.forEach((sign) => {
            const tagIndex = arrayData.findIndex((tag) => tag.name === sign);

            arrayData[tagIndex].total += 1;
            if (isComplete) {
              arrayData[tagIndex].complete += 1;
            }
          });

          setBarData(arrayData);
        });
      }
    }
  }, [data, tagsData]);

  if (isPending || tagsLoading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <div className="w-72 lg:block gap-2 hidden h-dvh">
        <div>
          <Link to="/todo/$id" params={{ id: formatDate(new Date()) }}>
            Todos
          </Link>
          <Link
            to={"/calendar/$date"}
            params={{ date: formatDate(new Date(), "PARTIAL") }}
          >
            Calendar
          </Link>
        </div>

        {/* BAR CHART */}
        <ResponsiveContainer className={"max-h-[600px]"}>
          <BarChart data={barData} layout="vertical">
            {/* <CartesianGrid strokeDasharray="5 5" />{" "} */}
            <YAxis dataKey={"name"} type="category" />
            <XAxis type="number" />
            <Tooltip />
            <Legend />
            <Bar dataKey={"total"} stackId="a" fill="#8884d8" />
            <Bar dataKey={"complete"} stackId="a" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col p-5 w-full h-dvh">
        <Calendar current={dateFormat} data={data} />
      </div>
    </>
  );
}
