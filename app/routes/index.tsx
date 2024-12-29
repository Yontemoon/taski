import { createFileRoute, useRouter, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { supabase } from "@/lib/supabase";

const getTodos = createServerFn({
  method: "GET",
}).handler(async () => {
  const todos = await supabase.from("todos").select("*");
  return todos.data;
});

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ href: "/login" });
    }
  },
  component: Home,
  loader: async () => await getTodos(),
});

function Home() {
  const router = useRouter();
  const state = Route.useLoaderData();

  if (!state) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>My Todos</h1>
      <ul>
        {state.map((todo) => (
          <li key={todo.id}>{todo.todo}</li>
        ))}
      </ul>
    </div>
  );
}
