import { createFileRoute, redirect } from "@tanstack/react-router";
import { Login } from "../components/Login";

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => {
    if (context) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginComp,
});

function LoginComp() {
  return <Login />;
}
