import { createFileRoute } from "@tanstack/react-router";
import Calendar from "@/components/calendar";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { tagsAllQueryOptions, todosByMonthQueryOptions } from "@/lib/options";

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
  const dateFormat = formatDate(date, "PARTIAL");
  const { data, isPending } = useQuery(todosByMonthQueryOptions(dateFormat));
  const { isPending: tagsLoading } = useQuery(
    tagsAllQueryOptions(context.auth.user?.id!)
  );

  if (isPending || tagsLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <Calendar current={dateFormat} data={data} />
    </div>
  );
}
