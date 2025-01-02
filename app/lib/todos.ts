import { queryOptions } from "@tanstack/react-query";
import { getSupabaseServerClient } from "@/lib/supabase";
import { createServerFn } from "@tanstack/start";
import { extractHashtag } from "./utils";

const getTodos = createServerFn({
  method: "GET",
})
  .validator((userId: unknown) => userId as string)
  .handler(async ({ data }) => {
    const supabase = await getSupabaseServerClient();
    const todos = await supabase.from("todos").select("*").eq("user_id", data);
    return todos.data;
  });

const postTodos = createServerFn({
  method: "POST",
})
  .validator((data: { user_id: string; todo: string }) =>
    data as { user_id: string; todo: string }
  )
  .handler(async ({ data }) => {
    console.log("data", data);
    const supabase = await getSupabaseServerClient();
    const hashtags = extractHashtag(data.todo);

    if (hashtags.length >= 0) {
      await supabase.from("hashtags").insert(
        hashtags.map((tag) => ({ tags: tag, user_id: data.user_id })),
      );
    }

    await supabase.from("todos").insert(data);
    // return todo.data;
  });

const todosQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["todos", userId],
    queryFn: () =>
      getTodos(
        { data: userId },
      ),
  });

export { postTodos, todosQueryOptions };
