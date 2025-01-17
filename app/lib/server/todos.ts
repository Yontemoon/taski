import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import axios from "redaxios"
import { TTodos } from "@/types/tables.types";

const getTodos = createServerFn({
  method: "GET",
})
  .validator((data: { user_id: string; date: string }) => {
    if (!data.date || !data.user_id) {
      throw new Error("Invalid data provided");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
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
      const res = await axios(
        `http://localhost:3000/api/users/${user_id}/todo/${date}`,
      );
      const todos = await res.data as TTodos[]
      return todos;
    },

  });


export { todosQueryOptions };
