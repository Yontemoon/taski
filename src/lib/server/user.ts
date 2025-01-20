// import { createServerFn, Fetcher } from "@tanstack/start";
// import { getSupabaseServerClient } from "../supabaseServerClient";
// import { User } from "@supabase/supabase-js";

// export const fetchUser: Fetcher<undefined, undefined, User | null> =
//   createServerFn({
//     method: "GET",
//   }).handler(async () => {
//     const supabase = await getSupabaseServerClient();

//     const {
//       data: { user },
//       error,
//     } = await supabase.auth.getUser();
//     if (error) {
//       console.error("Error fetching user:", error);
//       return null;
//     }
//     if (!user) {
//       return null;
//     }

//     return user as any;
//   });

// export const signInUser = createServerFn({ method: "POST" })
//   .validator((data: { email: string; password: string }) =>
//     data as { email: string; password: string }
//   )
//   .handler(async ({ data }) => {
//     const supabase = await getSupabaseServerClient();
//     const { error } = await supabase.auth.signInWithPassword({
//       email: data.email,
//       password: data.password,
//     });

//     if (error) {
//       return {
//         error: true,
//         message: error.message,
//       };
//     }
//   });

// export const signOutUser: Fetcher<undefined, undefined, boolean> =
//   createServerFn({
//     method: "POST",
//   }).handler(async () => {
//     const supabase = await getSupabaseServerClient();

//     const { error } = await supabase.auth.signOut();
//     if (error) {
//       console.error("Error signing out:", error);
//       throw new Error("Failed to sign out");
//     }

//     return true;
//   });

// //   export const refreshSession: Fetcher<undefined, undefined, User | null> =
// //   createServerFn({
// //     method: "POST",
// //   }).handler(async () => {
// //     const supabase = await getSupabaseServerClient();

// //     const { data, error } = await supabase.auth.refreshSession();
// //     if (error) {
// //       console.error("Error refreshing session:", error);
// //       throw new Error("Failed to refresh session");
// //     }

// //     return data.user;
// //   });
