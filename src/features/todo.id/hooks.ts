import { dateTomorrow, dateYesterday, extractHashtag } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TAllTags, TTags, TTodos } from "@/types/tables.types";
import { addTodos, deleteTodo, updateIsComplete } from "@/lib/supabase";
import React, { useEffect } from "react";
import { TInputActions, TPayloadInput } from "./types";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { editTodo } from "@/lib/supabase/todo";

const useTodoMutations = (user_id: string, date: string) => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (data: { todo: string }) => {
      const mutationData = {
        ...data,
        user_id,
        date,
      };
      const res = await addTodos(mutationData);
      return res;
    },
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
      const updatedTags = Array.from(tagSet).map((tag) => ({
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
            user_id: user_id,
            id: crypto.randomUUID(),
          },
        ],
      );
      return previousTodos;
    },
    onError: (_err, _newTodo, context) => {
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
    onError: (_err, _todo_id, context) => {
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
    onError: (_err, _data, context) => {
      queryClient.setQueryData(["todos", user_id, date], context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user_id, date] });
      queryClient.invalidateQueries({ queryKey: ["tags", user_id, date] });
    },
  });


  const editMutation = useMutation({
    mutationFn: editTodo,
    // onMutate: () => {}
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user_id, date] });
      queryClient.invalidateQueries({ queryKey: ["tags", user_id, date] });
    }
  })

  return { addMutation, isCompleteMutation, deleteMutation, editMutation };
};

const inputReducer = (state: TPayloadInput, action: TInputActions) => {
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

    case "restart-tags":
      return {
        ...state,
        isOpen: false,
        tag: "",
        displayedTags: null,
        selectedTag: null,
      };
    case "hide-tags":
      return {
        ...state,
        isOpen: false,
      };

    case "show-vision":
      return {
        ...state,
        isOpen: true,
      };
    case "set-displayed-tags":
      return {
        ...state,
        displayedTags: action.payload,
      };
    case "set-selected-tag":
      return {
        ...state,
        selectedTag: action.payload,
      };
  }
};

const useTagSelectionReducer = () => {
  const queryClient = useQueryClient()
  const auth = useAuth()
  const [state, dispatch] = React.useReducer(inputReducer, {
    isOpen: false,
    tag: "",
    displayedTags: null,
    selectedTag: null,
    allTags: null,
  });

  useEffect(() => {
    if (!state.allTags) {
      const todos = queryClient.getQueryData(["tags", auth.user?.id]) as TAllTags[]
      dispatch({type: "set-allTags", payload: todos})
    }
  })

  return { state, dispatch };
};

const useKeybinds = () => {
  const navigate = useNavigate();
  const params = useParams({ from: "/_authed/todo/$id" });
  const [isNavigational, setIsNavigational] = React.useState(true);

  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (isNavigational) {
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
      }
    },
    [params.id, navigate, isNavigational],
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return { setIsNavigational };
};

export { useTodoMutations, useKeybinds, useTagSelectionReducer };
