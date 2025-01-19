import { createFileRoute, redirect } from "@tanstack/react-router";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/_authed/todo/")({
  beforeLoad() {
    throw redirect({
      to: "/todo/$id",
      params: {
        id: formatDate(new Date()),
      },
    });
  },
});
