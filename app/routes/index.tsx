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
    console.log("RESP", hello);
  },
  component: Home,
});

function Home() {
  return (
    <div className="w-full justify-center flex flex-col items-center">
      <h1>My Todos</h1>
    </div>
  );
}
