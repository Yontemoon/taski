import LinkIcon from "@/components/link-icon";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { House, Calendar, ListTodo } from "lucide-react";
import { formatDate } from "@/lib/utils";
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
        <aside className=" gap-2 fixed z-10 flex flex-grow-0 flex-shrink-0 flex-col items-center w-20 border border-r-1 h-screen top-0 left-0 overflow-x-hidden">
          <nav className="">
            <LinkIcon to={"/home"}>
              <House />
            </LinkIcon>
            <LinkIcon to="/todo/$id" params={{ id: formatDate(new Date()) }}>
              <ListTodo />
            </LinkIcon>
            <LinkIcon
              to={"/calendar/$date"}
              params={{ date: formatDate(new Date(), "PARTIAL") }}
            >
              <Calendar />
            </LinkIcon>

            <ThemeToggle />
          </nav>
        </aside>
        {/* Odd solution ml-20 */}
        <div className="flex flex-grow h-full items-stretch ml-20">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
