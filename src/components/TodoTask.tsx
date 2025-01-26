// import React from "react";
import type { TAllTags } from "@/types/tables.types";
import Tag from "./Tag";

type PropTypes = {
  todo: string;
  tags: TAllTags[] | null;
};

const TodoTask = ({ todo, tags }: PropTypes) => {
  const tasks = todo.split(" ").map((task, index) => {
    if (task[0] === "#") {
      const removedHashtag = task.slice(1);

      const colorNumber =
        tags?.find((tag) => tag.name === removedHashtag)?.color || null;

      return (
        <Tag key={index} colorNumber={colorNumber}>
          {removedHashtag}
        </Tag>
      );
    } else {
      return <span key={index}>{task} </span>;
    }
  });

  return <p className="flex flex-row items-center gap-1">{tasks}</p>;
};

export default TodoTask;
