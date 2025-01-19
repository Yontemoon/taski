import { Tables } from "./database.types";

type TTodos = Tables<"todos">;
type TTags = Tables<"tags">;

export type { TTags, TTodos };
