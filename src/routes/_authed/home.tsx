import React from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";

import YearGrid from "@/components/year-grid";
import Loader from "@/components/loader";
import { tagsAllQueryOptions } from "@/lib/options";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authed/home")({
  component: RouteComponent,
});

// TODO: Best way to add these yeargrids?
// Each grid being displayed should be based on what the user chooses.

function RouteComponent() {
  const { auth } = Route.useRouteContext();
  if (!auth.user) {
    throw redirect({ to: "/login" });
  }
  const { data: tags } = useQuery(tagsAllQueryOptions(auth.user?.id));
  return (
    <div className=" w-full items-center flex flex-col align-middle ">
      <React.Suspense fallback={<Loader />}>
        <YearGrid />
        {tags?.map((tag) => {
          return <YearGrid tag={tag.name} key={tag.id} />;
        })}
      </React.Suspense>
    </div>
  );
}
