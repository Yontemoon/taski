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


// ! There is no DELETE method in supabase, Maybe create a api call?
const deleteTodo = createServerFn({
  method: "POST"
})
.validator((data: {todo_id: number, user_id: string, todo: string} ) => data as {todo_id: number, user_id: string, todo: string}) 
.handler(async ({data}) => {
  console.log(data);

  const hashtags = extractHashtag(data.todo);

  const supabase = await getSupabaseServerClient();
  const deletedTodo = await supabase.from("todos").delete().eq("id",data.todo_id).eq("user_id", data.user_id).select()
  
  if (deletedTodo.status === 200 && hashtags.length > 0) {
    for (let i = 0; i < hashtags.length; i++) {
      const currentTag = hashtags[i]
      const isFound = await supabase.from("hashtags").select().eq("tags", currentTag).eq("user_id", data.user_id).single()
      if (isFound.data) {
        await supabase.from("hashtags").delete().eq("tags", currentTag).eq("user_id", data.user_id).select()
      }
    }
  }
  console.log(deletedTodo);


})

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
    const todoResponse = await supabase.from("todos").insert(data).select().single();
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
        existingTags.map((tag) => [tag.tags, tag.id])
      );

      console.log(existingTagsMap);

      // Step 2b: Insert new hashtags in bulk
      const newHashtags = formattedHashtags.filter(
        (tag) => !existingTagsMap.has(tag.tags)
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

export { postTodos, deleteTodo, todosQueryOptions };
