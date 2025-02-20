import Sidebar from "@/components/sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { KeybindsTodoProvider } from "@/context/keybinds";

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
    <>
      <div className="flex h-screen w-full">
        <div className="max-w-64 w-full border-r h-full hidden md:block">
          <Sidebar />
        </div>
        <KeybindsTodoProvider>
          <div className="flex flex-grow h-full items-stretch">
            <Outlet />
          </div>
        </KeybindsTodoProvider>
      </div>
    </>
  );
}
