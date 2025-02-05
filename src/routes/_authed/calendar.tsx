import { createFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/_authed/calendar")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex">
      <div className="w-52 max-w-52 md:flex flex-col gap-2 hidden ">
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
      <Outlet />
    </div>
  );
}
