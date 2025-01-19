import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { redis } from "@/lib/cache";
import { TTodos } from "@/types/tables.types";

export const APIRoute = createAPIFileRoute("/api/todo/$id")({
  DELETE: async ({ params }) => {
    const { id } = params;
    try {
      const supabase = await getSupabaseServerClient();
      const { data: deletedTodo, error: deleteTodoError } = await supabase
        .from("todos")
        .delete()
        .eq("id", id)
        .select()
        .single();

      if (deleteTodoError) {
        console.error("Error deleting todo:", deleteTodoError.message);
        throw new Error("Failed to delete the todo");
      }

      if (!deletedTodo) {
        console.error("No todo found to delete with the provided ID");
        throw new Error("Todo not found");
      }

      if (deletedTodo) {
        redis.get(
          `todo:${deletedTodo.user_id}:${deletedTodo.date_set}`,
          (error, result) => {
            if (error) {
              throw new Error(error.message);
            }
            if (result) {
              const jsonResult: TTodos[] = JSON.parse(result);

              const newTodos = jsonResult.filter((todo) => {
                if (todo.id === Number(id)) {
                  return null;
                }
                return todo;
              });
              console.log(newTodos);
              redis.set(
                `todo:${deletedTodo.user_id}:${deletedTodo.date_set}`,
                JSON.stringify(newTodos),
              );
            }
          },
        );
      }

      return new Response("Todo Complete");
    } catch (error) {
      console.error("Error in deleteTodo handler:", error);
      return new Response("Todo failed");
    }
  },
});
