import { queryOptions } from "@tanstack/react-query";
import { getTagsByDate } from "@/lib/supabase/tags";
import { getTodos } from "@/lib/supabase/todo";

const tagsQueryOptions = (user_id: string, date: string) =>
  queryOptions({
    queryKey: ["tags", user_id, date],
    queryFn: () => getTagsByDate(user_id, date),
  });

const todosQueryOptions = (user_id: string, date: string) =>
  queryOptions({
    queryKey: ["todos", user_id, date],
    queryFn: () => getTodos(user_id, date),
  });

export { todosQueryOptions, tagsQueryOptions };
