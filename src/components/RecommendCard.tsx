import React from "react";

import { Card, CardContent } from "./ui/card";
import type { TAllTags } from "@/types/tables.types";
import { cn } from "@/lib/utils";

type PropTypes = {
  list: TAllTags[] | null;
  selected: TAllTags | null;
  onSelect: (tag: TAllTags) => void;
} & Omit<React.ComponentProps<"li">, "onSelect">;

const RecommendCard = ({ list, selected, onSelect, ...props }: PropTypes) => {
  return (
    <Card className="absolute top-full left-0 w-full max-h-64 overflow-auto shadow-lg z-50">
      <CardContent>
        <ul className="space-y-2">
          {list?.map((tag, index) => {
            const isSelected = selected?.id === tag.id;
            return (
              <li
                key={index}
                className={cn(
                  `p-2 cursor-pointer ${
                    selected?.id === tag.id ? "bg-gray-200" : ""
                  }`
                )}
                onClick={() => onSelect(tag)}
                ref={(e) => {
                  if (isSelected) {
                    e?.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                    });
                  }
                }}
                {...props}
              >
                {tag.name}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecommendCard;
