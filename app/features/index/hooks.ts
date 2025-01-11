import { addTodos, deleteTodo, updateIsComplete } from "@/lib/todos";
import { extractHashtag } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TTags, TTodos } from "@/types/tables.types";

const useIndexMutations = (user_id: string, date: string) => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: addTodos,
    onMutate: async (data) => {
      const newHashtags = extractHashtag(data.todo);
      await queryClient.cancelQueries({ queryKey: ["tags", user_id, date] });
      await queryClient.cancelQueries({
        queryKey: ["todos", user_id, date],
      });

      const previousTags = queryClient.getQueryData(["tags", user_id, date]) as
        | TTags[]
        | [];

      const tagSet = new Set(previousTags.map((prevTag) => prevTag.name));
      newHashtags.forEach((tag) => tagSet.add(tag.replace("#", "")));
      const updatedTags = Array.from(tagSet).map((tag, index) => ({
        id: crypto.randomUUID(),
        name: tag,
      }));
      await queryClient.setQueryData(["tags", user_id, date], updatedTags);

      const previousTodos = queryClient.getQueryData([
        "todos",
        user_id,
        date,
      ]);
      queryClient.setQueryData(
        ["todos", user_id, date],
        (old: TTodos[]) => [
          ...old,
          {
            todo: data?.todo,
            user_id: data?.user_id,
            id: crypto.randomUUID(),
          },
        ],
      );
      return previousTodos;
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["todos", user_id, date], context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user_id, date] });
      queryClient.invalidateQueries({ queryKey: ["tags", user_id, date] });
    },
  });

  const isCompleteMutation = useMutation({
    mutationFn: updateIsComplete,
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["todos", user_id, date] });

      const previousTodos = queryClient.getQueryData([
        "todos",
        user_id,
        date,
      ]) as TTodos[];

      const updatedTodos = previousTodos.map((todo) => {
        if (todo.id === data.todo_id) {
          return {
            ...todo,
            is_complete: data.status,
          };
        }
        return todo;
      });

      queryClient.setQueryData(["todos", user_id, date], updatedTodos);
      return previousTodos;
    },
    onError: (err, todo_id, context) => {
      queryClient.setQueryData(["todos", user_id, date], context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user_id, date] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onMutate: async ({ todo_id, user_id }) => {
      await queryClient.cancelQueries({ queryKey: ["todos", user_id, date] });

      const previousTodos = queryClient.getQueryData(["todos", user_id, date]);
      queryClient.setQueryData(["todos", user_id, date], (old: TTodos[]) => [
        ...old.filter((oldTodo) => oldTodo.id !== todo_id),
      ]);
      return previousTodos;
    },
    onError: (err, data, context) => {
      queryClient.setQueryData(["todos", user_id, date], context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user_id, date] });
      queryClient.invalidateQueries({ queryKey: ["tags", user_id, date] });
    },
  });

  return { addMutation, isCompleteMutation, deleteMutation };
};

export { useIndexMutations };
