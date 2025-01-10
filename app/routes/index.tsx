import { createFileRoute, redirect } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { todosQueryOptions } from "@/lib/todos";
import { tagsQueryOptions } from "@/lib/tags";
import {
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { postTodos, deleteTodo, isCompleteTodo } from "@/lib/todos";
import { TTags, TTodos } from "@/types/tables.types";
import { cn, extractHashtag } from "@/lib/utils";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (!context?.id) {
      throw redirect({ to: "/login" });
    }
  },
  loader: async ({ context }) => {
    if (context.id) {
      const tags = await context.queryClient.ensureQueryData(
        tagsQueryOptions(context.id)
      );

      const todos = await context.queryClient.ensureQueryData(
        todosQueryOptions(context.id)
      );
      return { todos, tags };
    }
  },
  component: Home,
});

function Home() {
  const user = Route.useRouteContext();
  const { data, isLoading, error } = useSuspenseQuery(
    todosQueryOptions(user?.id)
  );

  const { data: tags, isLoading: tagsLoading } = useSuspenseQuery(
    tagsQueryOptions(user?.id)
  );

  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: postTodos,
    onMutate: async ({ data }) => {
      const newHashtags = extractHashtag(data.todo);

      const previousTags = queryClient.getQueryData(["tags", user?.id]) as
        | TTags[]
        | [];

      const tagSet = new Set(previousTags.map((prevTag) => prevTag.name));
      newHashtags.forEach((tag) => tagSet.add(tag.replace("#", "")));
      const updatedTags = Array.from(tagSet).map((tag, index) => ({
        id: crypto.randomUUID(),
        name: tag,
      }));

      await queryClient.cancelQueries({ queryKey: ["tags", user?.id] });
      await queryClient.setQueryData(["tags", user?.id], updatedTags);
      await queryClient.cancelQueries({ queryKey: ["todos", user?.id] });

      const previousTodos = queryClient.getQueryData(["todos", user?.id]);
      queryClient.setQueryData(["todos", user?.id], (old: TTodos[]) => [
        ...old,
        {
          todo: data?.todo,
          user_id: data?.user_id,
          id: crypto.randomUUID(),
        },
      ]);
      return previousTodos;
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["todos", user?.id], context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["tags", user?.id] });
    },
  });

  const isCompleteMutation = useMutation({
    mutationFn: isCompleteTodo,
    onMutate: async ({ data }) => {
      await queryClient.cancelQueries({ queryKey: ["todos", user?.id] });

      const previousTodos = queryClient.getQueryData([
        "todos",
        user?.id,
      ]) as TTodos[];

      const updatedTodos = previousTodos.map((todo) => {
        if (todo.id === data.todo_id) {
          return {
            ...todo,
            is_complete: data.is_completed,
          };
        }
        return todo;
      });

      queryClient.setQueryData(["todos", user?.id], updatedTodos);
      return previousTodos;
    },
    onError: (err, todo_id, context) => {
      queryClient.setQueryData(["todos", user?.id], context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onMutate: async (todo_id) => {
      await queryClient.cancelQueries({ queryKey: ["todos", user?.id] });

      const previousTodos = queryClient.getQueryData(["todos", user?.id]);
      queryClient.setQueryData(["todos", user?.id], (old: TTodos[]) => [
        ...old.filter((todo) => todo.id !== todo_id.data.todo_id),
      ]);
      return previousTodos;
    },
    onError: (err, todo_id, context) => {
      queryClient.setQueryData(["todos", user?.id], context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["tags", user?.id] });
    },
  });

  const form = useForm({
    defaultValues: {
      todo: "",
    },

    onSubmit: async ({ value }) => {
      const data = {
        user_id: user?.id,
        todo: value.todo,
      };
      addMutation.mutate({ data });
    },
  });

  if (isLoading || tagsLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error occured.</div>;
  }

  return (
    <div className="w-full justify-center flex flex-col items-center">
      <h1>My Todos</h1>

      <form
        className="flex gap-5 justify-center items-center max-w-5xl w-full"
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await form.handleSubmit();
          form.reset();
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
        <form.Subscribe
          selector={(state) => state.isSubmitting}
          children={(isSubmitting) => {
            return (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting" : "Submit"}
              </Button>
            );
          }}
        />
      </form>

      <div>
        <ul className="flex gap-2 ">
          {tags?.map((tag) => {
            return (
              <li
                key={tag.id}
                className="border-solid border-black border p-2 hover:cursor-pointer"
                onClick={() => console.log(tag.name)}
              >
                {tag.name}
              </li>
            );
          })}
        </ul>
      </div>
      <ul className="max-w-5xl w-full px-5">
        {data?.map((todo) => (
          <li key={todo.id} className="flex justify-between gap-5 w-full mb-2">
            <p
              onClick={() => {
                if (isCompleteMutation.isPending) {
                  return;
                }
                const data = {
                  user_id: user.id,
                  todo_id: todo.id,
                  is_completed: !todo?.status,
                };
                isCompleteMutation.mutate({ data });
              }}
              className={cn(
                "hover:cursor-pointer",
                todo?.status && "line-through"
              )}
            >
              {todo?.todo}
            </p>
            <Button
              onClick={() => {
                const data = {
                  todo_id: todo.id,
                  user_id: user?.id,
                };
                deleteMutation.mutate({ data });
              }}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
