import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/todo")({
  beforeLoad: async ({ context }) => {
    if (!context?.auth.user?.id) {
      console.log("_authed/todo");
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
