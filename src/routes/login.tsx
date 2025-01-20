import { createFileRoute, redirect } from "@tanstack/react-router";
import { Login } from "../components/Login";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    if (context.auth.user) {
      throw redirect({ to: "/", search: { date: formatDate(new Date()) } });
    }
  },
  component: LoginComp,
});

function LoginComp() {
  return (
    <div>
      <Card />
    </div>
  );
}
