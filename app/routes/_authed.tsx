import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Login } from "../components/Login";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";

export const loginFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { email: string; password: string })
  .handler(async ({ data }) => {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return {
        error: true,
        message: error.message,
      };
    }
  });

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context }) => {
    console.log("context in _authed", context);
    if (!context.id) {
      throw new Error("Not authenticated");
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === "Not authenticated") {
      return <Login />;
    }

    throw error;
  },
});
