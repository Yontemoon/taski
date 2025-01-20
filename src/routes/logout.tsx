import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/logout")({
  preload: false,
  beforeLoad: async ({ context }) => {
    await context.auth.signOut();
    throw redirect({
      to: "/login",
    });
  },
});
