import { createFileRoute, redirect } from "@tanstack/react-router";
import { Login } from "../components/Login";
import { fetchUser } from "./__root";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    if (context.id) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginComp,
});

function LoginComp() {
  return <Login />;
}
