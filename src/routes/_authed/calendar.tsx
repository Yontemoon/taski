import { createFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { KeybindsCalendarProvider } from "@/context/keybinds";

export const Route = createFileRoute("/_authed/calendar")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <KeybindsCalendarProvider>
      <div className="flex h-screen">
        <Outlet />
      </div>
    </KeybindsCalendarProvider>
  );
}
