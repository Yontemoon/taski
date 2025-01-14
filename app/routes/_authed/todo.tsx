import { createFileRoute } from "@tanstack/react-router";
import { ZIndexSearch } from "@/types/z.types";
import { redirect } from "@tanstack/react-router";
import { todosQueryOptions } from "@/lib/todos";
import { tagsQueryOptions } from "@/lib/server/tags";

export const Route = createFileRoute("/_authed/todo")({
  validateSearch: ZIndexSearch,
  beforeLoad: async ({ context, search }) => {
    if (!context?.id) {
      throw redirect({ to: "/login" });
    }

    return search;
  },
  loaderDeps: ({ search: { date } }) => ({
    date,
  }),
  loader: async ({ context, deps }) => {
    const userId = context.id;
    const cachedTodos = context.queryClient.getQueriesData({
      queryKey: ["todos", userId, deps.date],
    })[0];
    const cachedTags = context.queryClient.getQueriesData({
      queryKey: ["tags", userId, deps.date],
    })[0];

    if (cachedTodos && cachedTags) {
      return { tags: cachedTags, todos: cachedTodos };
    }
    if (context.id) {
      const tags = await context.queryClient.ensureQueryData(
        tagsQueryOptions(userId, deps.date)
      );

      const todos = await context.queryClient.ensureQueryData(
        todosQueryOptions(userId, deps.date)
      );
      return { todos, tags };
    }
  },
  component: TodoComponenet,
});

function TodoComponenet() {
  const loaderData = Route.useLoaderData();
  return <div>{JSON.stringify(loaderData)}</div>;
}
