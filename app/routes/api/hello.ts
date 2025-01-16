// routes/api/hello.ts
import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";

export const APIRoute = createAPIFileRoute("/api/hello")({
  GET: async ({ request }) => {
    return json({ message: "Hello world" });
  },
});
