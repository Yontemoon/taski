import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import Calendar from "@/features/calendar.date/calendar";
import {
  cn,
  extractHashtag,
  formatDate,
  getColorFill,
  getColorStroke,
} from "@/lib/utils";
import { useQueries } from "@tanstack/react-query";
import { tagsAllQueryOptions, todosByMonthQueryOptions } from "@/lib/options";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { z } from "zod";
import Loader from "@/components/loader";

const calendarSearchParams = z.object({
  tag: z.string().optional(),
  is_complete: z.boolean().optional(),
});

export const Route = createFileRoute("/_authed/calendar/$date")({
  validateSearch: calendarSearchParams,
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
  const navigate = Route.useNavigate();
  const [barData, setBarData] = React.useState<
    {
      id: number;
      name: string;
      color: number;
      total: number;
      complete: number;
    }[]
  >();
  const dateFormat = formatDate(date, "PARTIAL");
  const results = useQueries({
    queries: [
      todosByMonthQueryOptions(dateFormat),
      tagsAllQueryOptions(context.auth.user?.id!),
    ],
  });
  const data = results[0].data;
  const tagsData = results[1].data;

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
          difference: 0,
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
            arrayData[tagIndex].difference =
              arrayData[tagIndex].total - arrayData[tagIndex].complete;
          });

          setBarData(arrayData);
        });
      }
    }
  }, [data, tagsData]);

  return (
    <>
      <div className="w-72 lg:block gap-2 hidden h-dvh">
        {/* BAR CHART */}
        {data ? (
          <ResponsiveContainer className={"max-h-[600px]"}>
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 20, bottom: 5 }}
              onClick={(e) => {
                console.log(e);
                const tag = e.activeLabel;
                navigate({
                  search: (_prev) => {
                    return {
                      tag,
                    };
                  },
                });
              }}
            >
              {/* <CartesianGrid strokeDasharray="5 5" />{" "} */}
              <YAxis dataKey={"name"} type="category" />
              <XAxis type="number" allowDecimals={false} />
              <Tooltip />
              {/* <Legend /> */}

              <Bar dataKey={"complete"} stackId="a">
                {barData?.map((entry) => {
                  const filledColor = getColorFill(entry.color);
                  const strokeColor = getColorStroke(entry.color);
                  return (
                    <Cell
                      key={entry.id}
                      // fill="#EF4343"
                      strokeWidth={2}
                      className={cn(filledColor, strokeColor)}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({
                          search: (prev) => {
                            return {
                              ...prev,
                              is_complete: true,
                              tag: entry.name,
                            };
                          },
                        });
                      }}
                    />
                  );
                })}
              </Bar>
              <Bar dataKey={"difference"} stackId="a">
                {barData?.map((entry, index) => {
                  const filledColor = getColorStroke(entry.color);

                  return (
                    <Cell
                      key={index}
                      strokeWidth={2}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({
                          search: (prev) => {
                            return {
                              ...prev,
                              is_complete: false,
                              tag: entry.name,
                            };
                          },
                        });
                      }}
                      // stroke="#EF4343"
                      // fill="#EF4343"
                      className={cn("fill-white box-border", filledColor)}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Loader />
        )}
      </div>
      <>
        <Calendar current={dateFormat} data={data} />
      </>
    </>
  );
}
