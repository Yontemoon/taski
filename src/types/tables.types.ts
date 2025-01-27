import { Tables } from "./database.types";

type TTodos = Tables<"todos">;
type TTags = Tables<"tags">;

type TAllTags = Omit<Tables<"tags">, "user_id">;

export type { TAllTags, TTags, TTodos };
