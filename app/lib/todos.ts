import { queryOptions } from "@tanstack/react-query";
import { getSupabaseServerClient } from "@/lib/supabase";
import { createServerFn } from "@tanstack/start";

const getTodos = createServerFn({
  method: "GET",
})
  .validator((data: {user_id: string, date: string}) => {
    if (!data.date || !data.user_id) {
      throw new Error("Invalid data provided")
    }
    return data
  })
  .handler(async ({ data }) => {
    const supabase = await getSupabaseServerClient();

    try {
      const { data: todos, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", data.user_id)
        .eq("date_set", data.date)
        .order("created_at", { ascending: true })

        console.log("TODOS", todos);
      if (error) {
        throw new Error(error.message);
      }

      return todos;
    } catch (error) {
      console.error("Error in getTodos", error);
      return [];
    }
  });

const deleteTodo = createServerFn({
  method: "POST",
})
  .validator((data: { todo_id: number; user_id: string }) => {
    if (!data.todo_id || !data.user_id) {
      throw new Error("Invalid data provided");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const supabase = await getSupabaseServerClient();

    try {
      const { data: deletedTodo, error: deleteTodoError } = await supabase
        .from("todos")
        .delete()
        .eq("id", data.todo_id)
        .eq("user_id", data.user_id)
        .select();

      if (deleteTodoError) {
        console.error("Error deleting todo:", deleteTodoError.message);
        throw new Error("Failed to delete the todo");
      }

      if (!deletedTodo || deletedTodo.length === 0) {
        console.warn("No todo found to delete with the provided ID");
        throw new Error("Todo not found");
      }

      return {
        success: true,
        message: "Todo and associated hashtags deleted successfully",
      };
    } catch (error) {
      console.error("Error in deleteTodo handler:", error);
      return {
        success: false,
        message: "Failed to delete todo",
      };
    }
  });

const isCompleteTodo = createServerFn({
  method: "POST",
})
  .validator(
    (data: { todo_id: number; user_id: string; is_completed: boolean }) => {
      if (!data.todo_id || !data.user_id || data.is_completed === undefined) {
        throw new Error("Invalid data provided");
      }
      return data;
    },
  )
  .handler(async ({ data }) => {
    const supabase = await getSupabaseServerClient();
    try {
      const response = await supabase
        .from("todos")
        .update({
          status: data.is_completed,
        })
        .eq("user_id", data.user_id)
        .eq("id", data.todo_id);

      if (response.error) {
        console.error("Error updating todo:", response.error.message);
        throw new Error("Failed to update the todo");
      }
      return {
        success: true,
        message: "Todo completion status updated successfully",
      };
    } catch (error) {
      console.error("Error in isCompleteTodo handler:", error);
      return {
        success: false,
        message: "Failed to change completion of todo",
      };
    }
  });

const postTodos = createServerFn({
  method: "POST",
})
  .validator((data: { user_id: string; todo: string }) =>
    data as { user_id: string; todo: string }
  )
  .handler(async ({ data: todoData }) => {
    const supabase = await getSupabaseServerClient();

    try {
      const { error } = await supabase.from("todos").insert({
        todo: todoData.todo,
        user_id: todoData.user_id,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        message: "Posting todo successful",
        success: true,
      };
    } catch (error) {
      console.error("Error posting new todo", error);
      return {
        message: "Error occured posting new todo",
        success: false,
      };
    }
  });

const todosQueryOptions = (user_id: string, date: string) =>
  queryOptions({
    queryKey: ["todos", user_id],
    queryFn: () =>
      getTodos(
        { data: {
          date, user_id
        } },
      ),
  });

export { deleteTodo, isCompleteTodo, postTodos, todosQueryOptions };
