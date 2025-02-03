import { supabase } from "@/lib/supabase";
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { formatDate } from "../utils";

const getTodosByMonth = async (data: {
  date: Date;
}) => {
  const { date } = data;

  const startMonth = startOfMonth(date);
  const endMonth = endOfMonth(date);
  const startCalendar = formatDate(startOfWeek(startMonth));
  const endCalendar = formatDate(endOfWeek(endMonth));

  try {
    const { data, error } = await supabase.from("todos").select("*").lte(
      "date_set",
      endCalendar,
    ).gte("date_set", startCalendar);

    if (error) {
      throw new Error(error.message);
    }
    console.log(data);

    return data;
  } catch (error) {
    console.error("Error in getTodosyByMonth", error);
  }
};

export { getTodosByMonth };
