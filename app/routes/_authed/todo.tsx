import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/todo')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/todo"!</div>
}
