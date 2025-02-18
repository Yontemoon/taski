import { queryOptions } from "@tanstack/react-query";
import { getAllTags, getTagsByDate } from "@/lib/supabase/tags";
import { getTodos } from "@/lib/supabase/todo";
import { getTodosByCreatedBy, getTodosByMonth } from "./supabase/todos";
import { formatDate } from "./utils";

const tagsQueryOptions = (user_id: string, date: string) =>
  queryOptions({
    queryKey: ["tags", user_id, date],
    queryFn: () => getTagsByDate(user_id, date),
    staleTime: Infinity,
  });

const todosQueryOptions = (user_id: string, date: string) =>
  queryOptions({
    queryKey: ["todos", user_id, date],
    queryFn: () => getTodos(user_id, date),
    staleTime: Infinity,
  });

const tagsAllQueryOptions = (user_id: string) =>
  queryOptions({
    queryKey: ["tags", user_id],
    queryFn: () => getAllTags(user_id),
    staleTime: Infinity,
  });

const todosByMonthQueryOptions = (date: Date) => {
  const yyyyMM = formatDate(date, "PARTIAL");

  return queryOptions({
    queryKey: ["calendar-todos", yyyyMM],
    queryFn: () => {
      const data = { date: date };
      return getTodosByMonth(data);
    },
    staleTime: Infinity,
  });
};

const todosByCreatedAtOptions = (date: number) => {
  return queryOptions({
    queryKey: ["create-at-todos", date],
    queryFn: () => {
      const data = { year: date };
      return getTodosByCreatedBy(data);
    },
  });
};
export {
  todosQueryOptions,
  tagsQueryOptions,
  tagsAllQueryOptions,
  todosByMonthQueryOptions,
  todosByCreatedAtOptions,
};
