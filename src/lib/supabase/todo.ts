import { supabase } from "@/lib/supabase";

const getTodos = async (user_id: string, date: string) => {
  try {
    const { data: todos, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user_id)
      .eq("date_set", date)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return todos || [];
  } catch (error) {
    console.error("Error in getTodos", error);
    return [];
  }
};

const addTodos = async (
  data: { todo: string; user_id: string; date: string },
) => {
  try {
    const { error, data: _todoData } = await supabase.from("todos").insert({
      todo: data.todo,
      user_id: data.user_id,
      date_set: data.date,
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
};

const deleteTodo = async (data: { todo_id: number; user_id: string }) => {
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
};

const updateIsComplete = async (
  data: { status: boolean; user_id: string; todo_id: number },
) => {
  try {
    const response = await supabase
      .from("todos")
      .update({
        status: data.status,
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
};

const getTags = async (user_id: string) => {
  try {
    const tags = await supabase
      .from("tags")
      .select("*")
      .eq(
        "user_id",
        user_id,
      )
      .order("id");
    return tags.data;
  } catch (error) {
    console.error("Error in getTags", error);
    return null;
  }
};

export { addTodos, deleteTodo, getTags, getTodos, updateIsComplete };
