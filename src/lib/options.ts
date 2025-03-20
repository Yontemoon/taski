import { queryOptions, infiniteQueryOptions } from "@tanstack/react-query";
import { getAllTags, getTagsByDate } from "@/lib/supabase/tags";
import { getTodos } from "@/lib/supabase/todo";
import {
  getTodosByCreatedBy,
  getTodosByMonth,
  getTodosByTag,
} from "./supabase/todos";
import { formatDate } from "./utils";
import { getSchedule } from "./supabase";

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

  const scheduleQueryOptions = () => {
    return infiniteQueryOptions ({
      queryKey: ["schedule"],
      queryFn: getSchedule,
      initialPageParam: 0,
      getNextPageParam: (lastPage, _pages) => {
        return lastPage?.data.length ? lastPage.nextPage : undefined
      },
    })
  }

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

const todosByCreatedAtOptions = (year: number) => {
  return queryOptions({
    queryKey: ["create-at-todos", year],
    queryFn: () => {
      const data = { year: year };
      return getTodosByCreatedBy(data);
    },
  });
};

const todosByTagOptions = (tag: string, year: number) => {
  return queryOptions({
    queryKey: ["todos-tag", tag, year],
    queryFn: () => {
      const data = { tag: tag, year: year };
      return getTodosByTag(data);
    },
  });
};

export {
  todosQueryOptions,
  tagsQueryOptions,
  tagsAllQueryOptions,
  todosByMonthQueryOptions,
  todosByCreatedAtOptions,
  todosByTagOptions,
  scheduleQueryOptions
};
