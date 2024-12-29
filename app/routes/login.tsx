import { createFileRoute, redirect } from "@tanstack/react-router";
import { Login } from "../components/Login";

export const Route = createFileRoute("/login")({
  component: LoginComp,
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ href: "/" });
    }
  },
});

function LoginComp() {
  return <Login />;
}
