import { TAllTags } from "@/types/tables.types";

type TPayloadInput = {
  isOpen: boolean;
  tag: string;
  displayedTags: TAllTags[] | null;
  selectedTag: TAllTags | null;
  allTags: TAllTags[] | null;
};

type TInputActions =
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
export type { TInputActions, TPayloadInput };
