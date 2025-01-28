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
import TodoTask from "@/components/TodoTask";
import Tag from "@/components/Tag";

export const Route = createFileRoute("/_authed/todo/$id")({
  beforeLoad: async ({ context }) => {
    if (!context?.auth?.user?.id) {
      throw redirect({ to: "/login" });
    }
  },
  component: RouteComponent,
});

type TPayloadInput = {
  isOpen: boolean;
  tag: string;
  displayedTags: TAllTags[] | null;
  selectedTag: TAllTags | null;
  allTags: TAllTags[] | null;
};

type InputActions =
  | {
      type: "present-tag";
      payload: string;
    }
  | {
      type: "hide-tags";
    }
  | {
      type: "set-displayed-tags";
      payload: TAllTags[] | null;
    }
  | {
      type: "set-seleted-tag";
      payload: TAllTags | null;
    }
  | {
      type: "set-allTags";
      payload: TAllTags[];
    }
  | {
      type: "set-tags";
      payload: TAllTags;
    };

const inputReducer = (state: TPayloadInput, action: InputActions) => {
  switch (action.type) {
    case "set-allTags":
      return {
        ...state,
        allTags: action.payload,
      };
    case "present-tag":
      const currentWord = action.payload.substring(1);
      const filteredList =
        state.allTags?.filter((tag) =>
          tag.name.toLowerCase().includes(currentWord.toLowerCase())
        ) || state.allTags;
      const firstTag = filteredList ? filteredList[0] : null;

      return {
        ...state,
        isOpen: true,
        tag: action.payload,
        selectedTag: firstTag,
        displayedTags: filteredList,
      };

    case "set-tags":
      return {
        ...state,
        selectedTag: action.payload,
      };

    case "hide-tags":
      return {
        ...state,
        isOpen: false,
        tag: "",
        displayedTags: null,
        selectedTag: null,
      };

    case "set-displayed-tags":
      return {
        ...state,
        displayedTags: action.payload,
      };
    case "set-seleted-tag":
      return {
        ...state,
        selectedTag: action.payload,
      };
  }
};

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

  const [state, dispatch] = React.useReducer(inputReducer, {
    isOpen: false,
    tag: "",
    displayedTags: null,
    selectedTag: null,
    allTags: null,
  });

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
    dispatch({ type: "hide-tags" });
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
                dispatch({ type: "hide-tags" });
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
                  // onFocus={() => {
                  //   if (
                  //     !isDialogOpen &&
                  //     currentTags &&
                  //     currentTags.length > 0
                  //   ) {
                  //     setIsDialogOpen(true);
                  //   }
                  // }}
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
                                type: "set-seleted-tag",
                                payload: state.displayedTags[0],
                              });
                            } else {
                              const nextTag = state.displayedTags[tagIndex + 1];

                              dispatch({
                                type: "set-seleted-tag",
                                payload: nextTag,
                              });
                            }
                          }

                          break;
                        case "ArrowUp":
                          e.preventDefault();
                          if (state.allTags) {
                            const tagIndex = state.allTags?.findIndex(
                              (tag) => tag.id === state.selectedTag?.id
                            );
                            if (tagIndex === 0) {
                              dispatch({
                                type: "set-seleted-tag",
                                payload:
                                  state.allTags[state.allTags.length - 1],
                              });
                            } else {
                              const nextTag = state.allTags[tagIndex - 1];

                              dispatch({
                                type: "set-seleted-tag",
                                payload: nextTag,
                              });
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
                      dispatch({ type: "present-tag", payload: lastWord });
                    } else {
                      dispatch({ type: "hide-tags" });
                    }
                    field.handleChange(value);
                  }}
                />

                {state.isOpen && (
                  <Card
                    ref={tagsListRef}
                    className="absolute z-10 max-h-52 overflow-y-auto bg-background max-w-screen-lg w-full mt-1"
                  >
                    <CardContent>
                      {state.displayedTags?.map((tag) => {
                        const isSelected = state.selectedTag?.id === tag.id;

                        return (
                          <div
                            key={tag.id}
                            className={cn(
                              "w-full hover:cursor-pointer",
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
                            onMouseEnter={(_e) => {
                              dispatch({
                                type: "set-seleted-tag",
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
                              dispatch({ type: "hide-tags" });

                              // setIsDialogOpen(false);
                              // setCurrentTags([]);
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
                              dispatch({ type: "hide-tags" });
                              // setIsDialogOpen(false);
                              // setCurrentTags([]);
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
          <ul className="flex gap-2 my-5">
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
        </div>
        <ul className="max-w-5xl w-full px-5">
          {data &&
            data?.map((todo) => {
              return (
                <li
                  key={todo.id}
                  className="flex justify-between gap-5 w-full mb-2"
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
                    // asChild
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
              );
            })}
        </ul>
      </Suspense>
    </>
  );
}
