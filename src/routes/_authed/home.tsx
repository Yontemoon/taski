import React from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";

import YearGrid from "@/components/year-grid";
import Loader from "@/components/loader";
import { todosByCreatedAtOptions } from "@/lib/options";
import { format } from "date-fns";

export const Route = createFileRoute("/_authed/home")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context?.auth.user?.id) {
      throw redirect({ to: "/login" });
    } else {
      const year = Number(format(new Date(), "yyyy"));
      context.queryClient.prefetchQuery(todosByCreatedAtOptions(year));
    }
  },
});

function RouteComponent() {
  const { auth } = Route.useRouteContext();
  if (!auth.user) {
    throw redirect({ to: "/login" });
  }

  return (
    <div className=" w-full items-center flex flex-col align-middle ">
      <React.Suspense fallback={<Loader />}>
        <YearGrid />
      </React.Suspense>
    </div>
  );
}
