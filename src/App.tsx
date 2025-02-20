import { createRouter, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "@/routeTree.gen";
import { AuthProvider, useAuth } from "./context/auth";
import { ThemeProvider } from "./context/theme";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient: queryClient, auth: undefined! },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 100,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} context={{ auth }} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}

export default App;
