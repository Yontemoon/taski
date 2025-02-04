import { supabase } from "@/lib/supabase";
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { formatDate } from "../utils";
import type { TTodos } from "@/types/tables.types";

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

    console.log(Object.fromEntries(dateMap));

    return Object.fromEntries(dateMap);
  } catch (error) {
    console.error("Error in getTodosyByMonth", error);
  }
};

export { getTodosByMonth };
