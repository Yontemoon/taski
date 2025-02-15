import React from "react";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { cn, getColor } from "@/lib/utils";
import type { FieldApi } from "@tanstack/react-form";
import { TInputActions, TPayloadInput } from "@/features/todo.id/types";
import { useOnClickOutside } from "usehooks-ts";
import { TAllTags } from "@/types/tables.types";
import { useKeybinds } from "@/context/keybinds";

type PropTypes = {
  field:
    | FieldApi<
        {
          todo: string;
        },
        "todo",
        undefined,
        undefined,
        string
      >
    | FieldApi<
        {
          todoEdit: string;
        },
        "todoEdit",
        undefined,
        undefined,
        string
      >
    | FieldApi<
        {
          todoEdit: string;
          todoEditAdditional: string;
        },
        "todoEdit",
        undefined,
        undefined,
        string
      >;
  allTags: TAllTags[] | null;
  name: string;
  dispatch: React.ActionDispatch<[action: TInputActions]>;
  state: TPayloadInput;
};

const InputSelector = ({
  field,
  allTags,
  name,
  dispatch,
  state,
}: PropTypes) => {
  const tagsListRef = React.useRef<HTMLDivElement>(null!);
  const { setIsNavigational } = useKeybinds();
  React.useEffect(() => {
    if (allTags) {
      dispatch({ type: "set-allTags", payload: allTags });
    }
  }, [allTags]);

  useOnClickOutside(tagsListRef, () => {
    dispatch({ type: "hide-tags" });
  });

  return (
    <div className="relative w-full">
      <div>
        <Input
          name={name}
          id="todo-input"
          placeholder="Do something productive!"
          value={field.state.value}
          onBlur={(_e) => {
            setIsNavigational(true);
            field.handleBlur();
          }}
          onBlurCapture={() => {
            setIsNavigational(true);
          }}
          autoComplete="off"
          onFocus={(_e) => {
            setIsNavigational(false);
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
                      const nextTag = state.displayedTags[tagIndex + 1];

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
                          state.displayedTags[state.displayedTags?.length - 1],
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
                    "w-full hover:cursor-pointer px-2 py-1 rounded-lg items-center flex gap-2 z-50",
                    state.selectedTag?.id === tag.id && "bg-foreground/10"
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
                    const allWordsExceptLast = words.slice(0, words.length - 1);
                    const stringifyWords = allWordsExceptLast.join(" ");

                    field.setValue(`${stringifyWords} #${tag.name}`);
                    dispatch({ type: "restart-tags" });
                  }}
                  onSelect={(_e) => {
                    const currentInput = field.state.value;

                    const words = currentInput.split(" ");
                    const allWordsExceptLast = words.slice(0, words.length - 1);
                    const stringifyWords = allWordsExceptLast.join(" ");

                    field.setValue(`${stringifyWords} #${tag.name}`);
                    dispatch({ type: "restart-tags" });
                  }}
                >
                  <div className={cn(colorsCN, "rounded-full h-5 w-5 z-50")} />
                  {tag.name}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InputSelector;
