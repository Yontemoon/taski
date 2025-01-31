import React from "react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    if (context.auth.user) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginComp,
});

function LoginComp() {
  const { auth } = Route.useRouteContext();
  const router = useRouter();
  const navigate = Route.useNavigate();
  const passwordRef = React.useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = React.useActionState(
    async (_prevState: any, formData: { email: string; password: string }) => {
      const { email, password } = formData;
      const res = await auth.signIn(email, password);

      if (res.error) {
        if (passwordRef.current) {
          passwordRef.current.value = "";
        }
        return {
          error: res.message || "Invalid credentials.",
          email: email,
        };
      }

      await router.invalidate();
      await navigate({
        to: "/todo/$id",
        params: { id: formatDate(new Date()) },
      });
      return { error: null, email: null };
    },
    { error: null, email: null }
  );

  return (
    <div className="flex justify-center pt-20">
      <Card className="w-full max-w-md mx-3">
        <CardHeader>
          <CardTitle>Taski</CardTitle>
          <CardDescription>Login</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="gap-5 flex flex-col"
            action={(formData) => {
              const email = formData.get("email") as string;
              const password = formData.get("password") as string;
              formAction({
                email: email,
                password: password,
              });
            }}
          >
            <div>
              <Label htmlFor="email">Email:</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={state.email || ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password:</Label>
              <Input
                id="password"
                name="password"
                type="password"
                ref={passwordRef}
                required
              />
            </div>

            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? "Logging in..." : "Login"}
            </Button>
            <div className="min-h-5">
              {state.error && <p className="text-destructive">{state.error}</p>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
