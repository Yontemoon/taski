import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/todo/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/todo/$id"!</div>
}
