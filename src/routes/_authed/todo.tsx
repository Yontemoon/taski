import { createFileRoute, Outlet } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/todo")({
  beforeLoad: async ({ context }) => {
    if (!context?.id) {
      throw redirect({ to: "/login" });
    }
  },
  component: TodoComponenet,
});

function TodoComponenet() {
  return (
    <div className="w-full justify-center flex flex-col items-center">
      <Outlet />
    </div>
  );
}
