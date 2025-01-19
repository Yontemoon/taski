import { useRouter } from "@tanstack/react-router";
import { useMutation } from "@/hooks/useMutation";
import { loginFn } from "@/routes/_authed";
import { Auth } from "./Auth";
import { userSignIn } from "@/lib/user";
import { formatDate } from "@/lib/utils";

export function Login() {
  const router = useRouter();

  const loginMutation = useMutation({
    fn: async ({ data }: any) => {
      console.log(data);
      const res = await loginFn({ data }); // server fn
      // const res = await userSignIn(data.email, data.password); //client side
      return res;
    },
    onSuccess: async (ctx) => {
      if (!ctx.data?.error) {
        await router.invalidate();
        router.navigate({
          to: "/todo/$id",
          params: { id: formatDate(new Date()) },
        });
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
