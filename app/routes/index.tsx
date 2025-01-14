import React, { useEffect } from "react";
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { todosQueryOptions } from "@/lib/server/todos";
import { tagsQueryOptions } from "@/lib/server/tags";
import { getTodos } from "@/lib/todos";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { cn, dateTomorrow, dateYesterday, formatDate } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { useIndexMutations } from "@/features/index/hooks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { parse } from "date-fns";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { tagsAllQueryOptions } from "@/lib/tags";
import { ZIndexSearch } from "@/types/z.types";

export const Route = createFileRoute("/")({
  validateSearch: ZIndexSearch,
  beforeLoad: async ({ context, search }) => {
    if (!context?.id) {
      throw redirect({ to: "/login" });
    }

    return search;
  },
  loaderDeps: ({ search: { date } }) => ({
    date,
  }),
  loader: async ({ context, deps }) => {
    const userId = context.id;
    const cacheCheck = context.queryClient.getQueriesData({
      queryKey: ["todos", userId, deps.date],
    });
    console.log("cache", cacheCheck);
    if (context.id) {
      const tags = await context.queryClient.ensureQueryData(
        tagsQueryOptions(userId, deps.date)
      );

      const todos = await context.queryClient.ensureQueryData(
        todosQueryOptions(userId, deps.date)
      );
      return { todos, tags };
    }
  },
  component: Home,
});

function Home() {
  const user = Route.useRouteContext();
  const { date } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [hoveredDate, setHoveredDate] = React.useState<string | null>(null);

  const { data, isLoading, error } = useSuspenseQuery(
    todosQueryOptions(user?.id, date)
  );

  const {
    data: tags,
    isLoading: tagsLoading,
    error: tagsError,
  } = useSuspenseQuery(tagsQueryOptions(user?.id, date));

  const { data: allTags } = useSuspenseQuery(tagsAllQueryOptions(user.id));

  const { refetch } = useQuery({
    queryFn: () => getTodos(user?.id, hoveredDate as string),
    queryKey: ["todos", user?.id, hoveredDate],
    enabled: hoveredDate !== null,
  });

  useEffect(() => {
    console.log(hoveredDate);
    if (hoveredDate !== null) {
      refetch();
    }
  }, [hoveredDate]);

  const { addMutation, deleteMutation, isCompleteMutation } = useIndexMutations(
    user.id,
    date
  );

  const form = useForm({
    defaultValues: {
      todo: "",
    },
    onSubmit: async ({ value }) => {
      const data = {
        todo: value.todo,
        user_id: user?.id,
        date: date,
      };
      addMutation.mutate(data);
    },
  });

  if (isLoading || tagsLoading) {
    return <div>Loading...</div>;
  }

  if (error || tagsError) {
    return <div>Error occured.</div>;
  }

  return (
    <div className="w-full justify-center flex flex-col items-center">
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
                  search: () => ({ date: formatedDate }),
                });
              }
            }}
          />
        </PopoverContent>
      </Popover>
      <div className="flex gap-5">
        <Link
          to="/"
          search={(prev) => {
            if (prev.date) {
              return {
                ...prev,
                date: formatDate(dateYesterday(prev.date)),
              };
            }
            return prev;
          }}
        >
          <ArrowLeft />
        </Link>
        <Link
          to="/"
          search={(prev) => {
            if (prev.date) {
              return {
                ...prev,
                date: formatDate(dateTomorrow(prev.date)),
              };
            }
            return prev;
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
                  user_id: user?.id,
                };
                deleteMutation.mutate(data);
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
