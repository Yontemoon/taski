import { TTodos } from "@/types/tables.types";
import { cn } from "@/lib/utils";
import { extractHashtag } from "@/lib/utils";
import { useRouteContext } from "@tanstack/react-router";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getColor } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { tagsAllQueryOptions } from "@/lib/options";

const TodoLine = ({
  todo,
  className,
}: {
  todo: TTodos;
  className?: string;
}) => {
  const context = useRouteContext({ from: "/_authed/calendar/$date" });
  const tags = extractHashtag(todo.todo).map((tag) => tag.slice(1));
  const isComplete = todo.status;
  const todoArray = todo.todo.trim().split(" ");
  const newSentence = todoArray.filter((word) => word[0] !== "#");
  const { data: allTags } = useSuspenseQuery(
    tagsAllQueryOptions(context.auth.user?.id!)
  );
  return (
    <div
      id="todo"
      className={cn(
        "bg-foreground/5 rounded-md line-clamp-1 truncate px-1 py-1 gap-1 w-full text-xs hover:bg-foreground/10 z-0 relative",
        className
      )}
    >
      {tags.map((tag) => {
        const tagColorNumber = allTags?.find((aTag) => aTag.name === tag)
          ?.color as number;

        const themeCN = getColor(tagColorNumber);
        return (
          <HoverCard key={tag}>
            <HoverCardTrigger>
              <div
                className={cn(
                  themeCN,
                  "h-4 w-4",
                  !isComplete && "bg-background"
                )}
              />
            </HoverCardTrigger>
            <HoverCardContent>{tag}</HoverCardContent>
          </HoverCard>
        );
      })}
      <span className={cn(todo.status && "line-through")}>
        {newSentence.join(" ")}
      </span>
    </div>
  );
};
export default TodoLine;
