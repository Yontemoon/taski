import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/todo/")({
  component: TodoIndexComponent,
});

function TodoIndexComponent() {
  return <div>Select a post.</div>;
}
