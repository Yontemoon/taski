import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";

import { cn, dateTomorrow, dateYesterday, formatDate } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { parse } from "date-fns";
import React, { Suspense } from "react";
import { useIndexMutations } from "@/features/index/hooks";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  tagsAllQueryOptions,
  tagsQueryOptions,
  todosQueryOptions,
} from "@/lib/options";
import { getTodos } from "@/lib/supabase/index";

export const Route = createFileRoute("/_authed/todo/$id")({
  beforeLoad: async ({ context }) => {
    if (!context?.auth?.user?.id) {
      throw redirect({ to: "/login" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const context = Route.useRouteContext();
  const router = useRouter();
  // const loaderData = Route.useLoaderData();
  const { id: date } = Route.useParams();
  const { data } = useSuspenseQuery(
    todosQueryOptions(context?.auth.user?.id!, date)
  );
  const { data: tags } = useSuspenseQuery(
    tagsQueryOptions(context?.auth.user?.id!, date)
  );

  const { data: allTags } = useSuspenseQuery(
    tagsAllQueryOptions(context?.auth.user?.id!)
  );

  console.log(allTags);

  const navigate = useNavigate({ from: Route.fullPath });
  const [hoveredDate, setHoveredDate] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (hoveredDate !== null) {
      // Check if data for the hovered date is already cached
      const cachedTodos = context.queryClient.getQueryData([
        "todos",
        context?.auth.user?.id!,
        hoveredDate,
      ]);

      if (!cachedTodos) {
        // Fetch and cache data for the hovered date
        context.queryClient.prefetchQuery({
          queryKey: ["todos", context?.auth.user?.id!, hoveredDate],
          queryFn: async () => {
            const todo = await getTodos(context?.auth.user?.id!, hoveredDate);
            return todo;
          },
        });
      }
    }
  }, [hoveredDate]);

  const { addMutation, deleteMutation, isCompleteMutation } = useIndexMutations(
    context.auth?.user?.id!,
    date
  );

  const form = useForm({
    defaultValues: {
      todo: "",
    },
    onSubmit: async ({ value }) => {
      const data = {
        todo: value.todo,
      };
      addMutation.mutate(data);
      router.invalidate();
    },
  });

  return (
    <>
      <h1>My Todos</h1>
      <h2>{formatDate(date)}</h2>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={"outline"}>
            <CalendarIcon size={24} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={parse(date, "yyyy-MM-dd", new Date())}
            onDayPointerEnter={(hoveredDate) => {
              const parsedDate = formatDate(hoveredDate);
              console.log(parsedDate);
              setHoveredDate(parsedDate);
            }}
            onDayPointerLeave={(prevDate) => {
              if (!prevDate) return;
              else setHoveredDate(null);
            }}
            onSelect={(date) => {
              if (date) {
                const formatedDate = formatDate(date);
                navigate({
                  to: "/todo/$id",
                  params: { id: formatedDate },
                });
              }
            }}
          />
        </PopoverContent>
      </Popover>
      <div className="flex gap-5">
        <Link
          to="/todo/$id"
          params={({ id }) => {
            if (id) {
              const yesterday = formatDate(dateYesterday(id));
              return { id: yesterday };
            }
            return { id: formatDate(new Date()) };
          }}
        >
          <ArrowLeft />
        </Link>
        <Link
          to="/todo/$id"
          params={({ id }) => {
            if (id) {
              const tomorrow = formatDate(dateTomorrow(id));
              return { id: tomorrow };
            }
            return { id: formatDate(new Date()) };
          }}
        >
          <ArrowRight />
        </Link>
      </div>
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
      <Suspense fallback={<div className="animate-spin h-5 w-5 ">loading</div>}>
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
          {data &&
            data?.map((todo) => (
              <li
                key={todo.id}
                className="flex justify-between gap-5 w-full mb-2"
              >
                <p
                  onClick={() => {
                    if (isCompleteMutation.isPending) {
                      return;
                    }
                    const data = {
                      user_id: context.auth.user?.id!,
                      todo_id: todo.id,
                      status: !todo?.status,
                    };
                    isCompleteMutation.mutate(data);
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
                      user_id: context.auth.user?.id!,
                    };
                    deleteMutation.mutate(data);
                  }}
                >
                  Delete
                </Button>
              </li>
            ))}
        </ul>
      </Suspense>
    </>
  );
}
