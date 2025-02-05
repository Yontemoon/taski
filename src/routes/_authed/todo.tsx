import Sidebar from "@/components/sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/_authed/todo")({
  beforeLoad: async ({ context }) => {
    if (!context?.auth.user?.id) {
      throw redirect({ to: "/login" });
    }
  },
  component: TodoComponenet,
});

function TodoComponenet() {
  const auth = useAuth();
  return (
    <div>
      <div className=" flex gap-2 text-lg p-2">
        <Link
          to="/todo/$id"
          params={{ id: formatDate(new Date()) }}
          activeProps={{
            className: "font-bold",
          }}
        >
          Home
        </Link>

        <Link to="/calendar" activeProps={{ className: "font-bold" }}>
          Calendar
        </Link>

        <div className="ml-auto">
          {auth?.user?.id ? (
            <>
              <span className="mr-2">{auth.user.email}</span>
              <Link to="/logout">Logout</Link>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
      <div className="flex h-screen">
        <div className="max-w-64 w-full border-r h-full hidden md:block">
          <Sidebar />
        </div>
        <div className="flex  w-full flex-col items-center mx-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
