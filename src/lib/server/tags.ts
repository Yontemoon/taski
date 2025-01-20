// import { queryOptions } from "@tanstack/react-query";
// import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
// import { createServerFn } from "@tanstack/start";

// const getTagsByDate = createServerFn({ method: "GET" }).validator(
//   (data: { user_id: string; date: string }) => {
//     if (!data.user_id) {
//       throw new Error("user_id is required");
//     }

//     if (!data.date) {
//       throw new Error("date is required");
//     }
//     return data;
//   },
// ).handler(async ({ data }) => {
//   const supabase = await getSupabaseServerClient();
//   try {
//     const { data: tags, error } = await supabase.rpc("get_tags", {
//       input_user_id: data.user_id,
//       input_date: data.date,
//     });

//     if (error) {
//       throw new Error(error.message);
//     }

//     return tags;
//   } catch (error) {
//     console.error("Error in getTags", error);
//     return null;
//   }
// });

// const getTagsCount = createServerFn({
//   method: "GET",
// }).validator((user_id: string) => {
//   if (!user_id) {
//     throw new Error("user_id is required");
//   }
//   return user_id;
// }).handler(async ({ data }) => {
//   const supabase = await getSupabaseServerClient();

//   try {
//   } catch (error) {
//     console.error("Error in getTagsCount", error);
//     return null;
//   }
// });

// const tagsQueryOptions = (user_id: string, date: string) =>
//   queryOptions({
//     queryKey: ["tags", user_id, date],
//     queryFn: () =>
//       getTagsByDate(
//         {
//           data: {
//             user_id,
//             date,
//           },
//         },
//       ),
//   });

// export { getTagsByDate, tagsQueryOptions };
