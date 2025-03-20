import React from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";

import YearGrid from "@/components/year-grid";
import Loader from "@/components/loader";

export const Route = createFileRoute("/_authed/home")({
  component: RouteComponent,
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
