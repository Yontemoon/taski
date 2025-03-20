import { scheduleQueryOptions } from "@/lib/options";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useInView } from "react-intersection-observer";

export const Route = createFileRoute("/_authed/schedule")({
  component: RouteComponent,
});

function RouteComponent() {
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
      <div className="m-auto px-5 py-2">
        {data?.pages.map((page, i) =>
          page?.data.map((item, index) => (
            <div
              key={item.id}
              ref={
                i === data.pages.length - 1 && index === page.data.length - 1
                  ? ref
                  : null
              }
            >
              {item.date_set} --- {item.todo}
            </div>
          ))
        )}
        {isFetchingNextPage && <h3>Loading...</h3>}
      </div>
    </div>
  );
}
