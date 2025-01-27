import React from "react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// import { User } from "@supabase/supabase-js";

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

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        setIsLoading(true);
        const res = await auth.signIn(value.email, value.password);
        if (typeof res !== "string") {
          await router.invalidate();
          await navigate({
            to: "/todo/$id",
            params: { id: formatDate(new Date()) },
          });
        }
        formApi.reset();
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="flex justify-center ">
      <Card>
        <CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <form.Field
                name="email"
                children={(field) => {
                  return (
                    <>
                      <Label>Email:</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </>
                  );
                }}
              />
              <form.Field
                name="password"
                children={(field) => {
                  return (
                    <>
                      <Label>Password:</Label>
                      <Input
                        type="password"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </>
                  );
                }}
              />
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Loading" : "Login"}
              </Button>
            </form>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}
