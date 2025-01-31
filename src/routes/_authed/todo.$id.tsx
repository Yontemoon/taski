import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import {
  cn,
  dateTomorrow,
  dateYesterday,
  formatDate,
  getColor,
} from "@/lib/utils";
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
import {
  useIndexMutations,
  useTagSelectionReducer,
} from "@/features/index/hooks";
import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  tagsAllQueryOptions,
  tagsQueryOptions,
  todosQueryOptions,
} from "@/lib/options";
import { getTodos } from "@/lib/supabase/index";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useOnClickOutside } from "usehooks-ts";
import TodoTask from "@/components/TodoTask";
import Tag from "@/components/Tag";
import { Trash } from "lucide-react";

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

  const params = Route.useParams();
  const tagsListRef = React.useRef<HTMLDivElement>(null!);

  const navigate = useNavigate({ from: Route.fullPath });
  const [hoveredDate, setHoveredDate] = React.useState<string | null>(null);

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

  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft": {
          const yesterday = dateYesterday(params.id, "string") as string;
          navigate({
            to: "/todo/$id",
            params: { id: yesterday },
          });
          break;
        }
        case "ArrowRight": {
          const tomorrow = dateTomorrow(params.id, "string") as string;
          navigate({
            to: "/todo/$id",
            params: { id: tomorrow },
          });
          break;
        }
      }
    },
    [params.id, navigate]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

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

  const { dispatch, state } = useTagSelectionReducer();

  React.useEffect(() => {
    if (allTags) {
      dispatch({ type: "set-allTags", payload: allTags });
    }
  }, [allTags]);

  useOnClickOutside(tagsListRef, () => {
    dispatch({ type: "hide-tags" });
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

  const { addMutation, deleteMutation, isCompleteMutation } = useIndexMutations(
    context.auth?.user?.id!,
    date
  );

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    await form.handleSubmit();
    form.reset();
    dispatch({ type: "restart-tags" });
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
              if (state.isOpen) {
                e.preventDefault();

                const currentTodo = form.state.values.todo;
                const words = currentTodo.split(" ");
                const allWordsExceptLast = words.slice(0, words.length - 1);
                const stringifyWords = allWordsExceptLast.join(" ");
                form.setFieldValue(
                  "todo",
                  `${stringifyWords} #${state.selectedTag?.name}`
                );
                dispatch({ type: "restart-tags" });
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
                <div>
                  <Input
                    name="todo"
                    id="todo-input"
                    placeholder="Do something productive!"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    autoComplete="off"
                    onFocus={(_e) => {
                      if (state.tag.length > 0) {
                        dispatch({ type: "show-vision" });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (state.isOpen) {
                        switch (e.key) {
                          case "ArrowDown":
                            e.preventDefault();

                            if (state.displayedTags) {
                              const tagIndex = state.displayedTags?.findIndex(
                                (tag) => tag.id === state.selectedTag?.id
                              );
                              if (tagIndex === state.displayedTags.length - 1) {
                                dispatch({
                                  type: "set-selected-tag",
                                  payload: state.displayedTags[0],
                                });
                              } else {
                                const nextTag =
                                  state.displayedTags[tagIndex + 1];

                                dispatch({
                                  type: "set-selected-tag",
                                  payload: nextTag,
                                });
                              }
                            }

                            break;
                          case "ArrowUp":
                            e.preventDefault();
                            if (state.displayedTags && state.allTags) {
                              const tagIndex = state.displayedTags?.findIndex(
                                (tag) => tag.id === state.selectedTag?.id
                              );

                              if (tagIndex === 0) {
                                dispatch({
                                  type: "set-selected-tag",
                                  payload:
                                    state.displayedTags[
                                      state.displayedTags?.length - 1
                                    ],
                                });
                              } else if (tagIndex) {
                                const nextTag = state.allTags[tagIndex - 1];

                                dispatch({
                                  type: "set-selected-tag",
                                  payload: nextTag,
                                });
                              }
                            }
                            break;
                          case "ArrowRight":
                            // e.preventDefault();

                            break;
                          case "ArrowLeft":
                            // e.preventDefault();
                            break;
                        }
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      const words = value.split(" ");
                      const lastWord = words[words.length - 1];

                      if (lastWord[0] === "#") {
                        dispatch({ type: "present-tag", payload: lastWord });
                      } else {
                        dispatch({ type: "restart-tags" });
                      }
                      field.handleChange(value);
                    }}
                  />
                </div>

                {state.isOpen && (
                  <Card
                    ref={tagsListRef}
                    className="absolute z-10 max-h-52 overflow-y-auto bg-background max-w-screen-lg w-full mt-1"
                  >
                    <CardContent className="p-2">
                      {state.displayedTags?.map((tag) => {
                        const isSelected = state.selectedTag?.id === tag.id;
                        const colorsCN = getColor(tag.color);

                        return (
                          <div
                            key={tag.id}
                            className={cn(
                              "w-full hover:cursor-pointer px-2 py-1 rounded-lg items-center flex gap-2",
                              state.selectedTag?.id === tag.id &&
                                "bg-foreground/10"
                            )}
                            ref={(e) => {
                              if (isSelected) {
                                e?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "nearest",
                                });
                              }
                            }}
                            onMouseEnter={() => {
                              dispatch({
                                type: "set-selected-tag",
                                payload: tag,
                              });
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
                              dispatch({ type: "restart-tags" });
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
                              dispatch({ type: "restart-tags" });
                            }}
                          >
                            <div
                              className={cn(colorsCN, "rounded-full h-5 w-5")}
                            />
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
        <ul className="flex gap-2 my-5 justify-start w-full max-w-5xl ">
          {tags?.map((tag) => {
            return (
              <li key={tag.id}>
                <Tag
                  size="lg"
                  colorNumber={tag.color}
                  onClick={() => console.log(tag.name)}
                >
                  {tag.name}
                </Tag>
              </li>
            );
          })}
        </ul>

        <ul className="max-w-5xl w-full gap-3">
          {data &&
            data?.map((todo) => {
              return (
                <li
                  key={todo.id}
                  className="flex justify-between gap-5 w-full mb-2 hover:border-gray-400 px-2 py-1 rounded-lg box-border border duration-100 ease-out transition-colors hover:cursor-pointer"
                >
                  <TodoTask
                    todo={todo}
                    tags={allTags}
                    completionAction={() => {
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
                  />

                  <Button
                    variant={"secondary"}
                    onClick={() => {
                      const data = {
                        todo_id: todo.id,
                        user_id: context.auth.user?.id!,
                      };
                      deleteMutation.mutate(data);
                    }}
                  >
                    <Trash />
                  </Button>
                </li>
              );
            })}
        </ul>
      </Suspense>
    </>
  );
}
