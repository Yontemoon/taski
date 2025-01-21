import { createFileRoute, redirect } from "@tanstack/react-router";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    if (context.auth.user) {
      throw redirect({ to: "/", search: { date: formatDate(new Date()) } });
    }
  },
  component: LoginComp,
});

function LoginComp() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: ({ value, formApi }) => {
      console.log(value);
      formApi.reset();
    },
  });

  return (
    <div className="flex justify-center">
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
                      <Label>Email:</Label>
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
              <Button className="w-full" type="submit">
                Login
              </Button>
            </form>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}
