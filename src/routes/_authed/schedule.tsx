import { scheduleQueryOptions, tagsAllQueryOptions } from "@/lib/options";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useInView } from "react-intersection-observer";
import TodoTask from "@/components/todo-task";
import { TTags } from "@/types/tables.types";

export const Route = createFileRoute("/_authed/schedule")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const userId = context?.auth?.user?.id;
    context.queryClient.prefetchQuery(tagsAllQueryOptions(userId!));
  },
});

function RouteComponent() {
  const context = Route.useRouteContext();
  const userId = context.auth.user?.id;
  const tags: TTags[] | null =
    context.queryClient.getQueryData(["tags", userId]) || null;
  console.log(tags);
  const { data, status, error, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery(scheduleQueryOptions());

  const { ref } = useInView({
    onChange(inView) {
      if (inView) {
        fetchNextPage();
      }
    },
    threshold: 1,
  });

  if (status === "pending") {
    return <div>Loading...</div>;
  }

  if (status === "error") {
    return <div>{error.message}</div>;
  }

  return (
    <div className="flex flex-grow h-full items-stretch flex-col">
      <div className="m-auto px-5 py-2 gap-3 flex flex-col">
        {data?.pages.map((page, i) =>
          page?.data.map((item, index) => (
            <div
              className="flex gap-1"
              key={item.id}
              ref={
                i === data.pages.length - 1 && index === page.data.length - 1
                  ? ref
                  : null
              }
            >
              <Link to={"/todo/$id"} params={{ id: item.date_set }}>
                {item.date_set}
              </Link>
              ---{" "}
              <TodoTask
                completionAction={() => {
                  null;
                }}
                tags={tags}
                todo={item}
              />
            </div>
          ))
        )}
        {isFetchingNextPage && <h3>Loading...</h3>}
      </div>
    </div>
  );
}
