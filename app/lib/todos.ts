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
      let newTagsId = []

    const todoResponse = await supabase.from("todos").insert(data).select().single()
    
    if (hashtags.length > 0) {
      const formatHashtags = hashtags.map((tag) => ({ tags: tag, user_id: data.user_id }));

      for (let i = 0; i < formatHashtags.length; i++) { 

        const currentTag = formatHashtags[i]
        const isFound = await supabase.from("hashtags").select().eq("tags", currentTag.tags).eq("user_id", currentTag.user_id).single()
        if (!isFound.data) {
          const tagResponse = await supabase.from("hashtags").insert(
            currentTag
          ).select().single()
        
          if (tagResponse.data) {
            newTagsId.push(tagResponse.data.id)
          }
        } else {
          newTagsId.push(isFound.data.id)
        }
      }
    }
    if (newTagsId.length > 0) {
      for (let i = 0; i < newTagsId.length; i++) {
        const currentTagId = newTagsId[i]
        console.log(currentTagId);
        await supabase.from("todo_hashtags").insert({todo_id: todoResponse.data?.id, hashtag_id: currentTagId})
      }
    }
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
