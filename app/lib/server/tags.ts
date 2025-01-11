import { queryOptions } from "@tanstack/react-query";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createServerFn } from "@tanstack/start";

const getTags = createServerFn({ method: "GET" }).validator(
  (user_id: string) => {
    if (!user_id) {
      throw new Error("user_id is required");
    }
    return user_id;
  },
).handler(async ({ data }) => {
  const supabase = await getSupabaseServerClient();
  try {
    const tags = await supabase.from("tags").select("*").eq(
      "user_id",
      data,
    )
      .order("id");
    return tags.data;
  } catch (error) {
    console.error("Error in getTags", error);
    return null;
  }
});

const getTagsCount = createServerFn({
  method: "GET",
}).validator((user_id: string) => {
  if (!user_id) {
    throw new Error("user_id is required");
  }
  return user_id;
}).handler(async ({ data }) => {
  const supabase = await getSupabaseServerClient();

  try {
  } catch (error) {
    console.error("Error in getTagsCount", error);
    return null;
  }
});

const tagsQueryOptions = (user_id: string) =>
  queryOptions({
    queryKey: ["tags", user_id],
    queryFn: () =>
      getTags(
        { data: user_id },
      ),
  });

export { getTags, tagsQueryOptions };
