import { queryOptions } from "@tanstack/react-query";
import { getSupabaseServerClient, supabase } from "@/lib/supabase";
import { createServerFn } from "@tanstack/start";

const getTodos = createServerFn({
  method: "GET",
})
  .validator((userId: unknown) => userId as string)
  .handler(async ({ data }) => {
    const supabase = await getSupabaseServerClient();
    const todos = await supabase.from("todos").select("*").eq("user_id", data);
    return todos.data;
  });

const todosQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["todos", userId],
    queryFn: () =>
      getTodos(
        { data: userId },
      ),
  });

export { todosQueryOptions };
