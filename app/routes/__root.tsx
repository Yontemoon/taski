import {
  Outlet,
  ScrollRestoration,
  createRootRoute,
} from "@tanstack/react-router";
import { Meta, Scripts, createServerFn } from "@tanstack/start";
import type { ReactNode } from "react";
import styles from "@/styles/app.css?url";
import { getSupabaseServerClient } from "@/lib/supabase";
import { NotFound } from "@/components/NotFound";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { Link } from "@tanstack/react-router";

const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getSupabaseServerClient();
  const { data, error: _error } = await supabase.auth.getUser();

  if (!data.user?.email) {
    return null;
  }

  // ! FIX LATER
  return data.user as any;
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Taski",
      },
    ],
    links: [{ rel: "stylesheet", href: styles }],
  }),
  beforeLoad: async ({ context }) => {
    const user = await fetchUser();
    console.log(user);
    return { user };
  },
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
  const { user } = Route.useRouteContext();
  return (
    <html>
      <head>
        <Meta />
      </head>
      <body>
        <div className="p-2 flex gap-2 text-lg">
          <Link
            to="/"
            activeProps={{
              className: "font-bold",
            }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>{" "}
          <div className="ml-auto">
            {user ? (
              <>
                <span className="mr-2">{user.email}</span>
                <Link to="/logout">Logout</Link>
              </>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </div>
        </div>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
