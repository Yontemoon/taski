import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/home")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>This is a home page for authenicated users!</div>;
}
