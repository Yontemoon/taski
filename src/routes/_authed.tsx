import { createFileRoute, redirect } from "@tanstack/react-router";
import { Login } from "../components/Login";

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.user?.id) {
      console.log(auth);
      // throw new Error("Not authenticated");
      throw redirect({ to: "/login" });
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === "Not authenticated") {
      return <Login />;
    }

    throw error;
  },
});
