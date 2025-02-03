import { createFileRoute } from "@tanstack/react-router";
import Calendar from "@/components/calendar";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/_authed/calendar/$date")({
  component: RouteComponent,
});

function RouteComponent() {
  const date = Route.useParams().date;
  const stringParsed = formatDate(date, "PARTIAL");
  console.log(stringParsed);

  return (
    <div>
      <Calendar current={stringParsed} />
    </div>
  );
}
