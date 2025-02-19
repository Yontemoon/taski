import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { formatDate } from "@/lib/utils";
import YearGrid from "@/components/year-grid";
import Loader from "@/components/loader";

export const Route = createFileRoute("/_authed/home")({
  component: RouteComponent,
});

// TODO: Best way to add these yeargrids?
// Each grid being displayed should be based on what the user chooses.

function RouteComponent() {
  return (
    <div>
      <div>
        <Link to="/home">Home</Link>
        <Link to="/todo/$id" params={{ id: formatDate(new Date()) }}>
          Todos
        </Link>
        <Link
          to={"/calendar/$date"}
          params={{ date: formatDate(new Date(), "PARTIAL") }}
        >
          Calendar
        </Link>
      </div>
      <React.Suspense fallback={<Loader />}>
        <YearGrid />
        <YearGrid tag={"Coding"} />
        <YearGrid tag={"Work"} />
      </React.Suspense>
    </div>
  );
}
