import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/calendar/$date")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <div>{params.date}</div>;
}
