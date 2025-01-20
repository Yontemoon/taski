import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const getAllTags = async (user_id: string) => {
  try {
    const { error, data } = await supabase.from("tags").select(
      "id, name, created_at",
    ).eq("user_id", user_id);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error in getAllTags", error);
    return null;
  }
};

const tagsAllQueryOptions = (user_id: string) =>
  queryOptions({
    queryKey: ["tags", user_id],
    queryFn: () => getAllTags(user_id),
  });

export { getAllTags, tagsAllQueryOptions };
