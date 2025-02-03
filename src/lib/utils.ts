import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { add, format, parse, sub } from "date-fns";
import { TColorTypes } from "@/types/color.types";
import { classColor } from "./themes";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractHashtag(text: string) {
  const regex = /#[\w]+/g;
  return text.match(regex) || [];
}

// YYYY-MM-DD
export function formatDate(
  date: Date | string,
  date_format: "COMPLETE" | "PARTIAL" = "COMPLETE",
) {
  switch (date_format) {
    case "COMPLETE":
      if (date instanceof Date) {
        return format(date, "yyyy-MM-dd");
      } else {
        const parsedDate = parse(date, "yyyy-MM-dd", new Date());
        return format(parsedDate, "MMMM do, yyy");
      }
    case "PARTIAL":
      if (date instanceof Date) {
        return format(date, "yyyy-MM");
      } else {
        const parsedDate = parse(date, "yyyy-MM", new Date());
        return format(parsedDate, "MMMM do, yyy");
      }
  }
}

export function dateTomorrow(date: string, returnType?: "Date" | "string") {
  const parsedDate = parse(date, "yyyy-MM-dd", new Date());

  const tomorrow = add(parsedDate, { days: 1 });
  if (returnType === "string") {
    return format(tomorrow, "yyyy-MM-dd");
  }

  return tomorrow;
}

export function dateYesterday(date: string, returnType?: "Date" | "string") {
  const parsedDate = parse(date, "yyyy-MM-dd", new Date());
  const yesterday = sub(parsedDate, { days: 1 });

  if (returnType === "string") {
    return format(yesterday, "yyyy-MM-dd");
  }

  return yesterday;
}

export function getColor(colorNumber: number) {
  return classColor[colorNumber as TColorTypes];
}
