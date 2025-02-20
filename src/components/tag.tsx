import React from "react";
import { cn } from "@/lib/utils";
import { TColorTypes } from "@/types/color.types";
import { classColor } from "@/lib/themes";

type PropTypes = {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  colorNumber: number;
} & React.ComponentProps<"span">;

const Tag = ({
  children,
  size = "md",
  colorNumber = 1,
  ...props
}: PropTypes) => {
  const color = classColor[colorNumber as TColorTypes];

  const className = cn([
    `border-solid transition-all duration-150 ease-in border hover:cursor-pointer rounded-lg items-center `,
    color,
    size === "sm" && "text-xs px-2 py-1 ",
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
