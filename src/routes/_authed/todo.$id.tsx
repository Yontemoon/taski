import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { cn, dateTomorrow, dateYesterday, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Trash } from "lucide-react";
import React from "react";
import { useTodoMutations } from "@/features/todo.id/hooks";
import { useForm } from "@tanstack/react-form";
import { useQueries, useQuery } from "@tanstack/react-query";

import {
  tagsAllQueryOptions,
  tagsQueryOptions,
  todosQueryOptions,
} from "@/lib/options";
import TodoTask from "@/components/todo-task";
import InputSelector from "@/components/input-selector";
import DialogEditTodo from "@/components/dialog/edit-todo";
import { DialogProvider } from "@/context/dialog";
import { useTagSelector } from "@/hooks/use-tag-selector";
import Tag from "@/components/tag";
import Loader from "@/components/loader";

export const Route = createFileRoute("/_authed/todo/$id")({
  beforeLoad: async ({ context, params }) => {
    const date = params.id;
    const userId = context?.auth?.user?.id!;
    context.queryClient.prefetchQuery(todosQueryOptions(userId, date));
    context.queryClient.prefetchQuery(tagsQueryOptions(userId, date));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const context = Route.useRouteContext();
  const router = useRouter();

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
  const results = useQueries({
    queries: [
      todosQueryOptions(context?.auth.user?.id!, date),
      tagsQueryOptions(context?.auth.user?.id!, date),
    ],
  });
  const { data: allTags } = useQuery(
    tagsAllQueryOptions(context?.auth.user?.id!)
  );
  const data = results[0].data;
  const tags = results[1].data;

  const { dispatch, state } = useTagSelector();

  const { addMutation, deleteMutation, isCompleteMutation } = useTodoMutations(
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
      <h2>{date}</h2>

      <div className="flex gap-5">
        <Link
          preload="viewport"
          to="/todo/$id"
          params={({ id }) => {
            if (id) {
              const yesterday = formatDate(dateYesterday(id)) as string;
              return { id: yesterday };
            }
            return { id: formatDate(new Date()) };
          }}
        >
          <ArrowLeft />
        </Link>
        <Link
          to="/todo/$id"
          preload="viewport"
          params={({ id }) => {
            if (id) {
              const tomorrow = formatDate(dateTomorrow(id)) as string;
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
                <InputSelector
                  name="todo"
                  field={field}
                  allTags={allTags!}
                  dispatch={dispatch}
                  state={state}
                />
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

      <div className="flex gap-1 my-5 justify-start w-full max-w-5xl flex-wrap">
        {tags?.map((tag) => {
          return (
            <Tag
              size="lg"
              key={tag.id}
              colorNumber={tag.color}
              onClick={() => console.log(tag.name)}
            >
              {tag.name}
            </Tag>
          );
        })}
      </div>
      {!data || (!tags && <Loader />)}
      {data && tags && (
        <ul className="max-w-5xl w-full gap-3">
          {data &&
            data?.map((todo) => {
              return (
                <DialogProvider
                  DialogComponent={<DialogEditTodo todo={todo} />}
                  key={todo.id}
                >
                  <li
                    className={cn(
                      `flex justify-between gap-5 w-full mb-2 hover:border-gray-400 px-2 py-1 rounded-lg box-border border
                     duration-100 ease-out transition-colors hover:cursor-pointer`
                    )}
                  >
                    <TodoTask
                      key={todo.id}
                      todo={todo}
                      tags={allTags!}
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

                    <div className="flex gap-2">
                      <Button
                        variant={"secondary"}
                        onClick={(e) => {
                          e.stopPropagation();
                          const data = {
                            todo_id: todo.id,
                            user_id: context.auth.user?.id!,
                          };
                          deleteMutation.mutate(data);
                        }}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </li>
                </DialogProvider>
              );
            })}
        </ul>
      )}
    </>
  );
}
