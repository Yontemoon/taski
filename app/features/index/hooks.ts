import { deleteTodo, isCompleteTodo, postTodos } from "@/lib/todos";
import { extractHashtag } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TTags, TTodos } from "@/types/tables.types";


const useIndexMutations = (user: {id: string}) => {

    const queryClient = useQueryClient()

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


      return { addMutation, isCompleteMutation, deleteMutation }
}


export {useIndexMutations}
