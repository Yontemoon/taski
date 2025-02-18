import { supabase } from "@/lib/supabase";
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { formatDate } from "../utils";
import type { TTodos } from "@/types/tables.types";
import { lastDayOfYear, parse, startOfYear } from "date-fns";

const getTodosByMonth = async (data: {
  date: Date;
}) => {
  const { date } = data;

  const startMonth = startOfMonth(date);
  const endMonth = endOfMonth(date);
  const startCalendar = formatDate(startOfWeek(startMonth));
  const endCalendar = formatDate(endOfWeek(endMonth));

  const dateMap = new Map<string, TTodos[]>();

  try {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .lte("date_set", endCalendar)
      .gte("date_set", startCalendar);

    if (error) {
      throw new Error(error.message);
    }

    for (let todo of data) {
      const date = todo.date_set;
      if (dateMap.has(date)) {
        const existingData = dateMap.get(date) as TTodos[];
        dateMap.set(date, [...existingData, todo]);
      } else {
        dateMap.set(date, [todo]);
      }
    }

    return Object.fromEntries(dateMap);
  } catch (error) {
    console.error("Error in getTodosyByMonth", error);
  }
};

const getTodosByCreatedBy = async (data: {
  year: number;
}) => {
  const dateFormat = parse(data.year.toString(), "yyyy", new Date());
  const endCalendar = formatDate(lastDayOfYear(dateFormat));
  const startCalendar = formatDate(startOfYear(dateFormat));
  const mapData = new Map<string, { count: number }>();

  try {
    const { data, error } = await supabase
      .from("todos")
      .select(`id, created_at`)
      .lte("date_set", endCalendar)
      .gte("date_set", startCalendar);

    if (error) {
      throw new Error(error.message);
    }

    for (const todo of data) {
      const date = new Date(todo.created_at!);
      const formattedDate = formatDate(date);

      if (mapData.has(formattedDate)) {
        const currCount = mapData?.get(formattedDate)?.count as number;
        mapData.set(formattedDate, { count: currCount + 1 });
      } else {
        mapData.set(formattedDate, { count: 1 });
      }
    }
    return Object.fromEntries(mapData);
  } catch (error) {
    console.error("Error fetching getTodosByCreatedBy");
  }
};

const getTodosByTag = async (data: { tag: string; year: number }) => {
  const dateFormat = parse(data.year.toString(), "yyyy", new Date());
  const endCalendar = formatDate(lastDayOfYear(dateFormat));
  const startCalendar = formatDate(startOfYear(dateFormat));
  const dataMap = new Map<
    string,
    { count: number }
  >();

  try {
    const { data: tagsTodos, error } = await supabase
      .from("tags")
      .select(`
        todos(
          id,
          date_set,
          todo,
          status
        )
        `)
      .eq("name", data.tag)
      .lte("todos.date_set", endCalendar)
      .gte("todos.date_set", startCalendar)
      .single();
    const todos = tagsTodos?.todos || [];

    if (error) {
      throw new Error(error.message);
    }

    for (const todo of todos) {
      const isPresent = dataMap.get(todo.date_set);

      if (isPresent) {
        dataMap.set(todo.date_set, { count: isPresent.count + 1 });
      } else {
        dataMap.set(todo.date_set, { count: 1 });
      }
    }

    return Object.fromEntries(dataMap);
  } catch (error) {
    console.error(error);
  }
};

export { getTodosByCreatedBy, getTodosByMonth, getTodosByTag };
