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
      const response = await supabase.from("todos").update({
        is_complete: data.is_completed,
      }).eq("user_id", data.user_id).eq("id", data.todo_id);

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
  .handler(async ({ data }) => {
    console.log("data", data);
    const supabase = await getSupabaseServerClient();

    const hashtags = extractHashtag(data.todo);
    const newTagsId: number[] = [];

    // Step 1: Insert the todo
    const todoResponse = await supabase.from("todos").insert(data).select()
      .single();
    if (todoResponse.error || !todoResponse.data) {
      throw new Error("Error inserting todo");
    }
    const todoId = todoResponse.data.id;

    // Step 2: Handle hashtags
    if (hashtags.length > 0) {
      const formattedHashtags = hashtags.map((tag) => ({
        tags: tag,
        user_id: data.user_id,
      }));

      // Step 2a: Check for existing hashtags in a single query
      const existingTagsResponse = await supabase
        .from("hashtags")
        .select()
        .in("tags", hashtags)
        .eq("user_id", data.user_id);

      if (existingTagsResponse.error) {
        throw new Error("Error fetching existing hashtags");
      }

      const existingTags = existingTagsResponse.data || [];
      const existingTagsMap = new Map(
        existingTags.map((tag) => [tag.tags, tag.id]),
      );

      console.log(existingTagsMap);

      // Step 2b: Insert new hashtags in bulk
      const newHashtags = formattedHashtags.filter(
        (tag) => !existingTagsMap.has(tag.tags),
      );
      if (newHashtags.length > 0) {
        const newTagsResponse = await supabase
          .from("hashtags")
          .insert(newHashtags)
          .select();
        if (newTagsResponse.error) {
          throw new Error("Error inserting new hashtags");
        }

        newTagsResponse.data.forEach((tag) => {
          existingTagsMap.set(tag.tags, tag.id);
        });
      }

      // Collect all tag IDs
      newTagsId.push(...Array.from(existingTagsMap.values()));
    }

    // Step 3: Link hashtags to todo in bulk
    if (newTagsId.length > 0) {
      const todoHashtags = newTagsId.map((hashtag_id) => ({
        todo_id: todoId,
        hashtag_id,
      }));

      const todoHashtagsResponse = await supabase
        .from("todo_hashtags")
        .insert(todoHashtags);

      if (todoHashtagsResponse.error) {
        throw new Error("Error inserting todo_hashtags");
      }
    }

    console.log("Todo and hashtags successfully saved");
  });

const todosQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["todos", userId],
    queryFn: () =>
      getTodos(
        { data: userId },
      ),
  });

export { deleteTodo, isCompleteTodo, postTodos, todosQueryOptions };
