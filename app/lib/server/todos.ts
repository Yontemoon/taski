import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";

const getTodos = createServerFn({
  method: "GET",
})
  .validator((data: { user_id: string; date: string }) => {
    if (!data.date || !data.user_id) {
      throw new Error("Invalid data provided");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const supabase = await getSupabaseServerClient();

    try {
      const { data: todos, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", data.user_id)
        .eq("date_set", data.date)
        .order("created_at", { ascending: true });
      if (error) {
        throw new Error(error.message);
      }

      return todos;
    } catch (error) {
      console.error("Error in getTodos", error);
      return [];
    }
  });

const todosQueryOptions = (user_id: string, date: string) =>
  queryOptions({
    queryKey: ["todos", user_id, date],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3000/api/users/${user_id}/todo/${date}`,
      );
      const todos = await res.json();
      console.log(todos);
      return todos;
    },
    // getTodos(
    //   {
    //     data: {
    //       date,
    //       user_id,
    //     },
    //   },
    // ),
  });

export { todosQueryOptions };
