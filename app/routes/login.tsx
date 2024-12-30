import { createFileRoute, redirect } from "@tanstack/react-router";
import { Login } from "../components/Login";
import { fetchUser } from "./__root";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    const user = await fetchUser();
    if (user) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginComp,
});

function LoginComp() {
  return <Login />;
}
