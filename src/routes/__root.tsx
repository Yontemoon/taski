import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";

import type { ReactNode } from "react";
import { NotFound } from "@/components/NotFound";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { Link } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { formatDate } from "@/lib/utils";
import type { AuthContextType } from "@/lib/auth";
import Sidebar from "@/components/sidebar";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  auth: AuthContextType;
}>()({
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { auth } = Route.useRouteContext();

  return (
    <>
      <div className="p-2 flex gap-2 text-lg">
        <Link
          to="/todo/$id"
          params={{ id: formatDate(new Date()) }}
          activeProps={{
            className: "font-bold",
          }}
          // activeOptions={{ exact: false }}
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

      {children}

      <ScrollRestoration />
      {import.meta.env.DEV && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
      {import.meta.env.DEV && (
        <ReactQueryDevtools buttonPosition="bottom-left" />
      )}
    </>
  );
}
