import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { formatDate } from "@/lib/utils";
import YearGrid from "@/components/year-grid";
import { useQuery } from "@tanstack/react-query";
import { todosByCreatedAtOptions, todosByTagOptions } from "@/lib/options";
import Loader from "@/components/loader";

export const Route = createFileRoute("/_authed/home")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = useQuery(todosByCreatedAtOptions(2025));
  const { data: codingTags } = useQuery(todosByTagOptions("Coding", 2025));
  return (
    <div>
      <div>
        <Link to="/home">Home</Link>
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
      {isLoading && <Loader />}
      {data && <YearGrid data={data!} />}
      {data && <YearGrid data={codingTags!} />}
    </div>
  );
}
