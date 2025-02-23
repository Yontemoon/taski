import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/schedule')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/schedule"!</div>
}
