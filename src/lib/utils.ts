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

export function formatDate(date: Date | string) {
  if (date instanceof Date) {
    return format(date, "yyyy-MM-dd");
  } else {
    const parsedDate = parse(date, "yyyy-MM-dd", new Date());
    return format(parsedDate, "MMMM do, yyy");
  }
}

export function dateTomorrow(date: string) {
  const parsedDate = parse(date, "yyyy-MM-dd", new Date());
  return add(parsedDate, { days: 1 });
}

export function dateYesterday(date: string) {
  const parsedDate = parse(date, "yyyy-MM-dd", new Date());
  return sub(parsedDate, { days: 1 });
}

export function getColor(colorNumber: number) {
  return classColor[colorNumber as TColorTypes];
}
