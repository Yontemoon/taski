import { useRouter } from "@tanstack/react-router";
import { useMutation } from "@/hooks/useMutation";
import { loginFn } from "@/routes/_authed";
import { Auth } from "./Auth";
import { userSignIn } from "@/lib/user";

export function Login() {
  const router = useRouter();

  const loginMutation = useMutation({
    fn: async ({ data }: any) => {
      console.log(data);
      // const res = await loginFn({ data }); // server fn
      const res = await userSignIn(data.email, data.password); //client side
      return res;
    },
    onSuccess: async (ctx) => {
      if (ctx.data?.success !== false) {
        await router.invalidate();
        router.navigate({ to: "/" });
        return;
      }
    },
  });

  return (
    <Auth
      actionText="Login"
      status={loginMutation.status}
      onSubmit={(e) => {
        const formData = new FormData(e.target as HTMLFormElement);
        loginMutation.mutate({
          data: {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
          },
        });
      }}
    />
  );
}
