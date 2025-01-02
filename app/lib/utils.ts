import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractHashtag(text: string) {
  const regex = /#[\w]+/g;
  return text.match(regex) || [];
}
