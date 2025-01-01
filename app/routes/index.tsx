import { createFileRoute, redirect } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { todosQueryOptions } from "@/lib/todos";
import { useSuspenseQuery } from "@tanstack/react-query";
// import type { User } from "@supabase/supabase-js";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (!context?.id) {
      throw redirect({ to: "/login" });
    }
  },
  loader: async ({ context }) => {
    console.log("CONTEXT", context);
    if (context.id) {
      const data = await context.queryClient.ensureQueryData(
        todosQueryOptions(context.id)
      );
      return data;
    }
  },
  component: Home,
});

function Home() {
  // const router = useRouter();
  const user = Route.useRouteContext();
  console.log(user);
  const { data, isLoading } = useSuspenseQuery(todosQueryOptions(user?.id));

  const form = useForm({
    defaultValues: {
      todo: "",
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      const data = {
        user_id: user?.id,
        todo: value.todo,
      };
      // postTodo({ data }).then(() => {
      //   router.invalidate();
      // });
    },
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }

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

      <ul>{data?.map((todo) => <li key={todo.id}>{todo.todo}</li>)}</ul>
    </div>
  );
}
