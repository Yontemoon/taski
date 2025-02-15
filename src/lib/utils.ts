import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { add, format, parse, sub } from "date-fns";
import { TColorTypes } from "@/types/color.types";
import { classColor, classColorFill, classColorStroke } from "./themes";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractHashtag(text: string) {
  const regex = /#[\w]+/g;
  return text.match(regex) || [];
}

// YYYY-MM-DD
export function formatDate<T extends Date | string>(
  date: T,
  date_format: "COMPLETE" | "PARTIAL" = "COMPLETE",
): T extends Date ? string : Date {
  if (date instanceof Date) {
    return (date_format === "COMPLETE"
      ? format(date, "yyyy-MM-dd")
      : format(date, "yyyy-MM")) as T extends Date ? string : Date;
  } else {
    const parsedDate = date_format === "COMPLETE"
      ? parse(date, "yyyy-MM-dd", new Date())
      : parse(date, "yyyy-MM", new Date());
    return parsedDate as T extends Date ? string : Date;
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

export function dateNextMonth(date: string) {
  const parseDate = parse(date, "yyyy-MM", new Date());
  const nextMonth = add(parseDate, { months: 1 });
  return formatDate(nextMonth, "PARTIAL");
}

export function datePrevMonth(date: string) {
  const parseDate = parse(date, "yyyy-MM", new Date());
  const nextMonth = sub(parseDate, { months: 1 });
  return formatDate(nextMonth, "PARTIAL");
}

export function getColor(colorNumber: number) {
  return classColor[colorNumber as TColorTypes];
}

export function getColorFill(colorNumber: number) {
  return classColorFill[colorNumber as TColorTypes];
}

export function getColorStroke(colorNumber: number) {
  return classColorStroke[colorNumber as TColorTypes];
}
