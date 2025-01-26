import { supabase } from "@/lib/supabase";

const getAllTags = async (user_id: string) => {
  try {
    const { error, data } = await supabase.from("tags").select(
      "id, name, created_at, color",
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

const getTagsByDate = async (user_id: string, date: string) => {
  try {
    const { data: tags, error } = await supabase.rpc("get_tags", {
      input_date: date,
      input_user_id: user_id,
    });

    if (error) {
      throw new Error(error.message);
    }
    console.log(tags);
    return tags;
  } catch (error) {
    console.error("Error in getTags", error);
    return null;
  }
};
export { getAllTags, getTagsByDate };
