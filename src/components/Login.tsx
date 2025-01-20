import { useRouter } from "@tanstack/react-router";
import { useMutation } from "@/hooks/useMutation";

import { Auth } from "./Auth";

import { formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export function Login() {
  const router = useRouter();
  const auth = useAuth();

  const loginMutation = useMutation({
    fn: async ({ data }: any) => {
      console.log(data);
      const res = await auth.signIn(data.email, data.password);
      console.log(res);
      return res;
    },
    onSuccess: async (ctx) => {
      if (ctx.data) {
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
