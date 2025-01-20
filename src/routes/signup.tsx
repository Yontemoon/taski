import { createFileRoute, redirect } from "@tanstack/react-router";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/signup")({
  beforeLoad({ context: { auth } }) {
    if (auth.user?.id) {
      throw redirect({ to: "/", search: { date: formatDate(new Date()) } });
    }
  },
  component: SignupComp,
});

function SignupComp() {
  // const { auth } = Route.useRouteContext()
  // const signupMutation = useMutation({
  //   fn: supabase.auth.signUp,
  // });

  return (
    <div>test</div>
    // <Auth
    //   actionText="Sign Up"
    //   status={signupMutation.status}
    //   onSubmit={(e) => {
    //     const formData = new FormData(e.target as HTMLFormElement);

    //     signupMutation.mutate({
    //       email: formData.get("email") as string,
    //       password: formData.get("password") as string,
    //     });
    //   }}
    //   afterSubmit={
    //     signupMutation.data?.error ? (
    //       <>
    //         <div className="text-red-400">{signupMutation.data.message}</div>
    //       </>
    //     ) : null
    //   }
    // />
  );
}
