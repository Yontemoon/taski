import { createFileRoute, useRouter, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";

const getTodos = createServerFn({
  method: "GET",
})
  .validator((userId: unknown) => userId as string)
  .handler(async ({ data }) => {
    const todos = await supabase.from("todos").select("*").eq("user_id", data);
    return todos.data;
  });

const postTodo = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    return data as { todo: string; user_id: string };
  })
  .handler(async ({ data }) => {
    console.log("DATA POST", data);
    const todo = await supabase.from("todos").insert(data).single();
    console.log(todo);
    return todo.data;
  });

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (!context) {
      throw redirect({ to: "/login" });
    }
  },
  component: Home,
  loader: async ({ context }) => {
    const todos = await getTodos({ data: context?.id });
    return { todos };
  },
});

function Home() {
  const router = useRouter();
  const loaderData = Route.useLoaderData();
  const user = Route.useRouteContext();

  const form = useForm({
    defaultValues: {
      todo: "",
    },
    onSubmit: async ({ value }) => {
      const data = {
        user_id: user?.id,
        todo: value.todo,
      };
      postTodo({ data }).then(() => {
        router.invalidate();
      });
    },
  });

  return (
    <div className="w-full justify-center flex flex-col items-center">
      <h1>My Todos</h1>
      <div className="flex gap-5 max-w-screen-md justify-center items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="todo"
            children={(field) => {
              return (
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              );
            }}
          />
          <Button type="submit">Add Todo</Button>
        </form>
      </div>

      <ul>
        {loaderData?.todos?.map((todo) => <li key={todo.id}>{todo.todo}</li>)}
      </ul>
    </div>
  );
}
