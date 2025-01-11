import { Database } from "@/types/database.types";
import { createServerClient } from "@supabase/ssr";
import { parseCookies, setCookie } from "vinxi/server";

export async function getSupabaseServerClient() {
  return createServerClient<Database>(
    process.env.SERVER_SUPABASE_URL!,
    process.env.SERVER_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // @ts-ignore Wait till Supabase overload works
        getAll() {
          return Object.entries(parseCookies()).map(([name, value]) => ({
            name,
            value,
          }));
        },
        setAll(cookies) {
          cookies.forEach((cookie) => {
            setCookie(cookie.name, cookie.value);
          });
        },
      },
    },
  );
}
