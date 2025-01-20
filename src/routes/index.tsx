import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="w-full justify-center flex flex-col items-center">
      <h1>My Todos</h1>
    </div>
  );
}
