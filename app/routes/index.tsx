import { createFileRoute } from "@tanstack/react-router";
import axios from "redaxios";

export const Route = createFileRoute("/")({
  loader: async ({ context, deps }) => {
    const res = await axios.get(`http://localhost:3000/api/hello`);

    console.log(res);
    const data = res.data;
    return data;
  },
  component: Home,
});

function Home() {
  const data = Route.useLoaderData();
  return (
    <div className="w-full justify-center flex flex-col items-center">
      <h1>My Todos</h1>
      <h2>{data.message}</h2>
    </div>
  );
}
