import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";
import { setHeaders } from "vinxi/http";

export const APIRoute = createAPIFileRoute("/api/users/$id/todo/$todoDate")({
  GET: async ({ request, params }) => {
    const supabase = await getSupabaseServerClient();
    const { id, todoDate } = params;
    try {
      const { data: todos, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", id)
        .eq("date_set", todoDate)
        .order("created_at", { ascending: true });

      setHeaders({
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      });
      if (error) {
        throw new Error(error.message);
      }

      return json(todos);
    } catch (error) {
      console.error("Error in getTodos", error);
      return json([]);
    }
  },
});
