import { createFileRoute, redirect } from "@tanstack/react-router";
import { Login } from "../components/Login";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    if (context.id) {
      throw redirect({ to: "/", search: { date: formatDate(new Date()) } });
    }
  },
  component: LoginComp,
});

function LoginComp() {
  return <Login />;
}
