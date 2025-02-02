import Sidebar from "@/components/sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/todo")({
  beforeLoad: async ({ context }) => {
    if (!context?.auth.user?.id) {
      throw redirect({ to: "/login" });
    }
  },
  component: TodoComponenet,
});

function TodoComponenet() {
  return (
    <div className="flex h-screen">
      <div className="max-w-64 w-full border-r h-full hidden md:block">
        <Sidebar />
      </div>
      <div className="flex  w-full flex-col items-center mx-4">
        <Outlet />
      </div>
    </div>
  );
}
