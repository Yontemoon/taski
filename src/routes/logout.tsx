import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/logout")({
  preload: false,
  loader: async ({ context }) => {
    await context.auth.signOut();
    throw redirect({
      to: "/login",
    });
  },
});
