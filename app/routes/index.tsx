import React from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { todosQueryOptions } from "@/lib/todos";
import { tagsQueryOptions } from "@/lib/tags";
import { useSuspenseQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { useIndexMutations } from "@/features/index/hooks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

  const { addMutation, deleteMutation, isCompleteMutation } = useIndexMutations(
    { id: user.id }
  );
  const [date, setDate] = React.useState<Date | undefined>(new Date());

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
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={"outline"}>
            <CalendarIcon size={24} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={setDate} />
        </PopoverContent>
      </Popover>

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
