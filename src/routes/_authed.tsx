import LinkIcon from "@/components/link-icon";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { House, Calendar, ListTodo, Logs } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.user?.id) {
      throw redirect({ to: "/login" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="overflow-auto block w-full h-screen ">
      <div className="flex w-full h-screen">
        <aside className="gap-2 fixed z-10 flex flex-grow-0 flex-shrink-0 flex-col items-center w-20 border border-r-1 h-screen top-0 left-0 overflow-x-hidden py-10">
          <div className="place-items-center flex flex-col justify-between h-screen">
            <nav className="grid grid-cols-1 gap-1 ">
              <LinkIcon to={"/home"}>
                <House />
              </LinkIcon>
              <LinkIcon to="/todo">
                <ListTodo />
              </LinkIcon>
              <LinkIcon to={"/calendar"}>
                <Calendar />
              </LinkIcon>
              <LinkIcon to={"/schedule"}>
                <Logs />
              </LinkIcon>
            </nav>
            <ThemeToggle />
          </div>
        </aside>
        {/* Odd solution ml-20 */}
        <div className="flex flex-grow h-full items-stretch ml-20">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
