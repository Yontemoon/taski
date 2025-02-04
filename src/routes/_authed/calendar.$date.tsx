import { createFileRoute } from "@tanstack/react-router";
import Calendar from "@/components/calendar";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getTodosByMonth } from "@/lib/supabase/todos";
import { tagsAllQueryOptions } from "@/lib/options";

export const Route = createFileRoute("/_authed/calendar/$date")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const userId = context.auth.user?.id as string;
    context.queryClient.prefetchQuery(tagsAllQueryOptions(userId));
  },
  // loader: ({ params }) => {
  //   const { date } = params;
  //   const { data, isPending } = useQuery({
  //     queryKey: ["calendar-todos", date],
  //     queryFn: async () => {
  //       const data = { date: date };
  //       const res = await getTodosByMonth(data);
  //       return res;
  //     },
  //   });

  //   return { data, isPending };
  // },
});

function RouteComponent() {
  const date = Route.useParams().date;
  const stringParsed = formatDate(date, "PARTIAL");
  const { data, isPending } = useQuery({
    queryKey: ["calendar-todos", stringParsed],
    staleTime: Infinity,
    queryFn: async () => {
      const data = { date: stringParsed };
      const res = await getTodosByMonth(data);
      return res;
    },
  });

  if (isPending) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      {/* {JSON.stringify(data)} */}
      <Calendar current={stringParsed} data={data} />
    </div>
  );
}
