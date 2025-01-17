import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  // beforeLoad: async ({ context, search }) => {
  //   if (!context?.id) {
  //     throw redirect({ to: "/login" });
  //   }

  //   return search;
  // },
  // loaderDeps: ({ search: { date } }) => ({
  //   date,
  // }),
  loader: async ({ context, deps }) => {
    const res = await fetch("http://localhost:3000/api/hello");
    const hello = await res.json();
    return hello;
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
