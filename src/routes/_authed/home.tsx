import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/_authed/home")({
  component: RouteComponent,
});

function RouteComponent() {
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
      <div>This is a home page for authenicated users!</div>
    </div>
  );
}
