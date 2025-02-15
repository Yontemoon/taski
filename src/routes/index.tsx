import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/context/auth";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const auth = useAuth();

  return (
    <div className="w-full justify-center flex flex-col items-center">
      <div className=" flex gap-2 text-lg p-2">
        <Link
          to="/todo/$id"
          params={{ id: formatDate(new Date()) }}
          activeProps={{
            className: "font-bold",
          }}
        >
          Home
        </Link>

        <Link to="/calendar" activeProps={{ className: "font-bold" }}>
          Calendar
        </Link>

        <div className="ml-auto">
          {auth?.user?.id ? (
            <>
              <span className="mr-2">{auth.user.email}</span>
              <Link to="/logout">Logout</Link>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
      <h1>Temporary Home page</h1>
      <p>What should i put here???</p>
    </div>
  );
}
