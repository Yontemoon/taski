import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
);

import {
  addTodos,
  deleteTodo,
  getTags,
  getTodos,
  updateIsComplete,
  editTodo
} from "./todo";
import {getTodosByMonth} from "./todos"

import { getAllTags, getTagsByDate, updateColor } from "./tags";

export {
  addTodos,
  deleteTodo,
  getTags,
  getTodos,
  updateIsComplete,
  getAllTags, 
  getTagsByDate, 
  updateColor,
  editTodo,
  getTodosByMonth
};
