import LinkIcon from "@/components/link-icon";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { House, Calendar, ListTodo } from "lucide-react";
import { formatDate } from "@/lib/utils";

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
    <div className="overflow-auto block w-full h-screen">
      <div className="flex w-full h-screen">
        <aside className=" gap-2 relative z-10 flex flex-grow-0 flex-shrink-0 flex-col items-center w-20 border border-r-1">
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
        </aside>
        <div className="flex flex-grow h-full items-stretch">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
