import React from "react";
import { TAllTags } from "@/types/tables.types";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth";

export type TPayloadInput = {
  isOpen: boolean;
  tag: string;
  displayedTags: TAllTags[] | null;
  selectedTag: TAllTags | null;
  allTags: TAllTags[] | null;
};

export type TInputActions =
  | {
      type: "present-tag";
      payload: string;
    }
  | {
      type: "restart-tags";
    }
  | {
      type: "show-vision";
    }
  | {
      type: "hide-tags";
    }
  | {
      type: "set-displayed-tags";
      payload: TAllTags[] | null;
    }
  | {
      type: "set-selected-tag";
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

const useTagSelector = () => {
  const queryClient = useQueryClient();
  const auth = useAuth();
  const [state, dispatch] = React.useReducer(inputReducer, {
    isOpen: false,
    tag: "",
    displayedTags: null,
    selectedTag: null,
    allTags: null,
  });

  React.useEffect(() => {
    if (!state.allTags) {
      const todos = queryClient.getQueryData([
        "tags",
        auth.user?.id,
      ]) as TAllTags[];
      dispatch({ type: "set-allTags", payload: todos });
    }
  });

  return { state, dispatch };
};

export { useTagSelector };
