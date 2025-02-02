// import React from "react";
import type { TAllTags } from "@/types/tables.types";
import Tag from "@/components/Tag";
import type { TTodos } from "@/types/tables.types";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import "@/styles/app.css";
import { TColorTypes } from "@/types/color.types";
import { updateColor } from "@/lib/supabase/tags";
import { useRouteContext } from "@tanstack/react-router";
import { themeButtonVariants } from "@/lib/themes";

type PropTypes = {
  todo: TTodos;
  tags: TAllTags[] | null;
  completionAction: () => void;
};

const TodoTask = ({ todo, tags, completionAction }: PropTypes) => {
  const tasks = todo.todo.split(" ").map((task, index) => {
    if (task[0] === "#") {
      const removedHashtag = task.slice(1);

      const tag = tags?.find((tag) => tag.name === removedHashtag) || null;

      return (
        <Popover key={index}>
          <PopoverTrigger
            onClick={(e) => {
              e.stopPropagation(); // Stops from triggering the dialog
            }}
          >
            <Tag colorNumber={tag?.color || 1}>{removedHashtag}</Tag>
          </PopoverTrigger>
          <PopoverContent className="mt-1 w-50 h-50 z-20" align="start">
            <TagThemeSelector currentTag={tag} />
          </PopoverContent>
        </Popover>
      );
    } else {
      return (
        <span
          key={index}
          className={cn(
            "hover:cursor-pointer z-10",
            todo?.status && "line-through"
          )}
        >
          {task}{" "}
        </span>
      );
    }
  });

  return (
    <p
      className="flex flex-row items-center gap-1"
      onClick={(e) => {
        e.stopPropagation(); // Stops from triggering the dialog
        completionAction();
      }}
    >
      {tasks}
    </p>
  );
};

const TagThemeSelector = ({ currentTag }: { currentTag: TAllTags | null }) => {
  const tags = Array.from({ length: 17 }, (_, index) => {
    const numberedColor = (index + 1) as TColorTypes;
    const theme = themeButtonVariants[numberedColor];
    const { queryClient, auth } = useRouteContext({
      from: "/_authed/todo/$id",
    });

    return (
      <div
        key={numberedColor}
        className={cn(
          ` rounded-full hover:cursor-pointer h-4 w-4 transition-all duration-300 ease-in-out z-20`,
          theme
        )}
        onClick={async () => {
          const isSameColor = currentTag?.color === numberedColor;
          if (!isSameColor && currentTag) {
            await updateColor(currentTag?.id, numberedColor);
            queryClient.invalidateQueries({
              queryKey: ["tags", auth.user?.id],
            });
          }
        }}
      />
    );
  });

  return (
    <div className="h-40 w-40">
      <p>{currentTag?.name}</p>
      <div className={cn("grid grid-cols-5 py-1 px-4 gap-1 rounded")}>
        {tags}
      </div>
    </div>
  );
};

export default TodoTask;
