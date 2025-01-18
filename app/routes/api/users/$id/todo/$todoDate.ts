import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";
import { setHeaders } from "vinxi/http";
import { redis } from "@/lib/cache";

export const APIRoute = createAPIFileRoute("/api/users/$id/todo/$todoDate")({
  GET: async ({ request, params }) => {
    const { id, todoDate } = params;

    const cachePresent = await redis.get(`todo:${id}:${todoDate}`);
    console.log("cache", cachePresent);

    if (cachePresent) {
      console.log("passing presnt");
      console.log(cachePresent);
      const parsedTodo = JSON.parse(cachePresent);
      return json(parsedTodo);
    }

    try {
      const supabase = await getSupabaseServerClient();

      const { data: todos, error } = await supabase
        .from("todos")
        .select("*")
        // .eq("user_id", id)
        .eq("date_set", todoDate)
        .order("created_at", { ascending: true });

      setHeaders({
        "Content-Type": "application/json",
        "Cache-Control": "public, force-cache",
      });
      if (error) {
        throw new Error(error.message);
      }
      await redis.set(`todo:${id}:${todoDate}`, JSON.stringify(todos));

      console.log(todos);

      return json(todos);
    } catch (error) {
      console.error("Error in getTodos", error);
      return json(null);
    }
  },
  POST: async ({ request, params }) => {
    const { todo } = await request.json() as { todo: string };
    const { id, todoDate } = params;
    console.log("todo", todo);
    try {
      const supabase = await getSupabaseServerClient();
      const { error } = await supabase
        .from("todos")
        .insert({
          todo: todo,
          user_id: id,
          date_set: todoDate,
        });

      if (error) {
        throw new Error(error.message);
      }
      const { data, error: getError } = await supabase.from("todos").select("*")
        .eq("date_set", todoDate).eq("user_id", id);

      if (getError) {
        throw new Error(getError.message);
      }

      if (data) {
        redis.set(`todo:${id}:${todoDate}`, JSON.stringify(data));
      }

      return new Response("Todo Complete");
    } catch (error) {
      console.error("Error posting new todo", error);
      return new Response("Todo failed");
    }
  },
});
