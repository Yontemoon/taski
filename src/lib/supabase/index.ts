import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import {
  addTodos,
  deleteTodo,
  getTags,
  getTodos,
  updateIsComplete,
} from "./todo";

import { getAllTags, getTagsByDate } from "./tags";

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
);

export { getAllTags, getTagsByDate };

export {
  addTodos,
  deleteTodo,
  getTags,
  getTodos,
  updateIsComplete,
};
