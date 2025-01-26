import React from "react";
import { cn } from "@/lib/utils";

type PropTypes = {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  colorNumber: number | null;
} & React.ComponentProps<"span">;

const Tag = ({ children, size = "md", colorNumber, ...props }: PropTypes) => {
  return (
    <span
      className={cn(
        `border-solid transition-all duration-150 ease-in border hover:cursor-pointer
        rounded-lg items-center
         bg-tag-${colorNumber}/20 hover:bg-tag-${colorNumber}/40 border-tag-${colorNumber}/40`,
        size === "sm" && "text-xs px-2 py-1",
        size === "md" && "text-sm px-3 py-1",
        size === "lg" && "text-base px-4 py-2"
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Tag;
