// routes/api/hello.ts
import { setHeaders } from "vinxi/http";
import { createAPIFileRoute } from "@tanstack/start/api";

export const APIRoute = createAPIFileRoute("/api/hello")({
  GET: async ({ request }) => {

    setHeaders({
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300, s-maxage=300"
    })
    console.log("passing api route");
    return new Response(
      JSON.stringify({message: "Hello worldssss"})
 )
  }
});
