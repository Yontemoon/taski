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
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  tagsAllQueryOptions,
  tagsQueryOptions,
  todosQueryOptions,
} from "@/lib/options";
import { getTodos } from "@/lib/supabase/index";

import { TAllTags } from "@/types/tables.types";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useOnClickOutside } from "usehooks-ts";

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
  const tagsListRef = React.useRef<HTMLDivElement>(null!);

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

  const navigate = useNavigate({ from: Route.fullPath });
  const [hoveredDate, setHoveredDate] = React.useState<string | null>(null);

  const [currentTag, setCurrentTag] = React.useState("");
  const [currentTags, setCurrentTags] = React.useState<TAllTags[] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedTag, setSelectedTag] = React.useState<TAllTags | null>(null);
  useOnClickOutside(tagsListRef, () => {
    setIsDialogOpen(false);
  });

  React.useEffect(() => {
    if (hoveredDate !== null) {
      const cachedTodos = context.queryClient.getQueryData([
        "todos",
        context?.auth.user?.id!,
        hoveredDate,
      ]);

      if (!cachedTodos) {
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

  React.useEffect(() => {
    console.log(currentTag);
    const currentWord = currentTag.substring(1);
    if (currentWord) {
      const filteredList =
        allTags?.filter((tag) =>
          tag.name.toLowerCase().includes(currentWord.toLowerCase())
        ) || allTags;
      setCurrentTags(filteredList);
      if (filteredList && filteredList.length > 0) {
        const firstTag = filteredList[0];
        setSelectedTag(firstTag);
      }
    } else {
      setCurrentTags(allTags);
    }
  }, [currentTag]);

  const { addMutation, deleteMutation, isCompleteMutation } = useIndexMutations(
    context.auth?.user?.id!,
    date
  );

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    await form.handleSubmit();
    form.reset();
  };

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
        id="todo-form"
        onSubmit={handleSubmitForm}
        onKeyDown={(e) => {
          switch (e.key) {
            case "Enter":
              if (isDialogOpen) {
                e.preventDefault();

                const currentTodo = form.state.values.todo;
                const words = currentTodo.split(" ");
                const allWordsExceptLast = words.slice(0, words.length - 1);
                const stringifyWords = allWordsExceptLast.join(" ");
                form.setFieldValue(
                  "todo",
                  `${stringifyWords} #${selectedTag?.name}`
                );
                setIsDialogOpen(false);
                setCurrentTags([]);
                break;
              }
          }
        }}
      >
        <form.Field
          name="todo"
          children={(field) => {
            return (
              <div className="relative w-full">
                <Input
                  name="todo"
                  id="todo-input"
                  placeholder="Do something productive!"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  autoComplete="off"
                  onFocus={() => {
                    if (
                      !isDialogOpen &&
                      currentTags &&
                      currentTags.length > 0
                    ) {
                      setIsDialogOpen(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (isDialogOpen) {
                      switch (e.key) {
                        case "ArrowDown":
                          e.preventDefault();
                          if (currentTags) {
                            const tagIndex = currentTags?.findIndex(
                              (tag) => tag.id === selectedTag?.id
                            );
                            if (tagIndex === currentTags.length - 1) {
                              setSelectedTag(currentTags[0]);
                            } else {
                              const nextTag = currentTags[tagIndex + 1];
                              setSelectedTag(nextTag);
                            }
                          }

                          break;
                        case "ArrowUp":
                          e.preventDefault();
                          if (currentTags) {
                            const tagIndex = currentTags?.findIndex(
                              (tag) => tag.id === selectedTag?.id
                            );
                            if (tagIndex === 0) {
                              setSelectedTag(
                                currentTags[currentTags.length - 1]
                              );
                            } else {
                              const nextTag = currentTags[tagIndex - 1];
                              setSelectedTag(nextTag);
                            }
                          }
                          break;
                        case "ArrowRight":
                          e.preventDefault();
                          break;
                        case "ArrowLeft":
                          e.preventDefault();
                          break;
                      }
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    const words = value.split(" ");
                    const lastWord = words[words.length - 1];

                    if (lastWord[0] === "#") {
                      setIsDialogOpen(true);

                      setCurrentTag(lastWord);
                    } else {
                      setIsDialogOpen(false);
                      setCurrentTag("");
                      setCurrentTags([]);
                    }
                    field.handleChange(value);
                  }}
                />

                {isDialogOpen && (
                  <Card
                    ref={tagsListRef}
                    className="absolute z-10 max-h-52 overflow-y-auto bg-background max-w-screen-lg w-full mt-1"
                  >
                    <CardContent>
                      {currentTags?.map((tag) => {
                        return (
                          <div
                            key={tag.id}
                            className={cn(
                              "w-full hover:cursor-pointer",
                              selectedTag?.id === tag.id && "bg-foreground/10"
                            )}
                            onMouseEnter={() => {
                              setSelectedTag(tag);
                            }}
                            onClick={() => {
                              const currentInput = field.state.value;

                              const words = currentInput.split(" ");
                              const allWordsExceptLast = words.slice(
                                0,
                                words.length - 1
                              );
                              const stringifyWords =
                                allWordsExceptLast.join(" ");

                              field.setValue(`${stringifyWords} #${tag.name}`);

                              setIsDialogOpen(false);
                              setCurrentTags([]);
                            }}
                            onSelect={(_e) => {
                              const currentInput = field.state.value;

                              const words = currentInput.split(" ");
                              const allWordsExceptLast = words.slice(
                                0,
                                words.length - 1
                              );
                              const stringifyWords =
                                allWordsExceptLast.join(" ");

                              field.setValue(`${stringifyWords} #${tag.name}`);

                              setIsDialogOpen(false);
                              setCurrentTags([]);
                            }}
                          >
                            {tag.name}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}
              </div>
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
