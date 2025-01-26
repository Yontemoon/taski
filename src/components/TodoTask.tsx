// import React from "react";
import type { TAllTags } from "@/types/tables.types";
import Tag from "@/components/Tag";
import type { TTodos } from "@/types/tables.types";
import { cn } from "@/lib/utils";

type PropTypes = {
  todo: TTodos;
  tags: TAllTags[] | null;
  completionAction: () => void;
};

const TodoTask = ({ todo, tags, completionAction }: PropTypes) => {
  const tasks = todo.todo.split(" ").map((task, index) => {
    if (task[0] === "#") {
      const removedHashtag = task.slice(1);

      const colorNumber =
        tags?.find((tag) => tag.name === removedHashtag)?.color || null;

      return (
        <Tag
          key={index}
          colorNumber={colorNumber}
          onClick={() => {
            const tagId = tags?.find((tag) => tag.name === removedHashtag)?.id;

            if (tagId) {
              console.log(tagId);
            }
          }}
        >
          {removedHashtag}
        </Tag>
      );
    } else {
      return (
        <span
          key={index}
          onClick={completionAction}
          className={cn("hover:cursor-pointer", todo?.status && "line-through")}
        >
          {task}{" "}
        </span>
      );
    }
  });

  return <p className="flex flex-row items-center gap-1">{tasks}</p>;
};

export default TodoTask;
