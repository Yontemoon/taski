import React from "react";
import { cn } from "@/lib/utils";
import { TColorTypes } from "@/types/color.types";

type PropTypes = {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  colorNumber: number;
} & React.ComponentProps<"span">;

const classColor = {
  1: "bg-tag-1/20 hover:bg-tag-1/40 border-tag-1/40",
  2: "bg-tag-2/20 hover:bg-tag-2/40 border-tag-2/40",
  3: "bg-tag-3/20 hover:bg-tag-3/40 border-tag-3/40",
  4: "bg-tag-4/20 hover:bg-tag-4/40 border-tag-4/40",
  5: "bg-tag-5/20 hover:bg-tag-5/40 border-tag-5/40",
  6: "bg-tag-6/20 hover:bg-tag-6/40 border-tag-6/40",
  7: "bg-tag-7/20 hover:bg-tag-7/40 border-tag-7/40",
  8: "bg-tag-8/20 hover:bg-tag-8/40 border-tag-8/40",
  9: "bg-tag-9/20 hover:bg-tag-9/40 border-tag-9/40",
  10: "bg-tag-10/20 hover:bg-tag-10/40 border-tag-10/40",
  11: "bg-tag-11/20 hover:bg-tag-11/40 border-tag-11/40",
  12: "bg-tag-12/20 hover:bg-tag-12/40 border-tag-12/40",
  13: "bg-tag-13/20 hover:bg-tag-13/40 border-tag-13/40",
  14: "bg-tag-14/20 hover:bg-tag-14/40 border-tag-14/40",
  15: "bg-tag-15/20 hover:bg-tag-15/40 border-tag-15/40",
  16: "bg-tag-16/20 hover:bg-tag-16/40 border-tag-16/40",
  17: "bg-tag-17/20 hover:bg-tag-17/40 border-tag-17/40",
};

const Tag = ({
  children,
  size = "md",
  colorNumber = 1,
  ...props
}: PropTypes) => {
  const color = classColor[colorNumber as TColorTypes];

  const className = cn([
    `border-solid transition-all duration-150 ease-in border hover:cursor-pointer rounded-lg items-center`,
    color,
    size === "sm" && "text-xs px-2 py-1",
    size === "md" && "text-sm px-3 py-1",
    size === "lg" && "text-base px-4 py-2",
  ]);

  return (
    <span className={className} {...props}>
      {children}
    </span>
  );
};

export default Tag;
