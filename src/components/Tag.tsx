import React from "react";
import { cn } from "@/lib/utils";

type PropTypes = {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  colorNumber: number | null;
} & React.ComponentProps<"span">;

const Tag = ({ children, size = "md", colorNumber, ...props }: PropTypes) => {
  const colorString = `border-tag-${colorNumber}/40 bg-tag-${colorNumber}/20 hover:bg-tag-${colorNumber}/40`;
  return (
    <span
      {...props}
      className={cn(
        "border-solid border-tag-11/40 bg-tag-11/20 hover:bg-tag-11/40 transition-color duration-150 ease-in border hover:cursor-pointer rounded-lg items-center",
        {
          "text-xs px-2 py-1": size === "sm",
          "text-sm px-3 py-1": size === "md",
          "text-base px-4 py-2": size === "lg",
        },
        colorString
      )}
    >
      {children}
    </span>
  );
};

export default Tag;
