import { createFileRoute, redirect } from '@tanstack/react-router'
import { formatDate } from '@/lib/utils'

export const Route = createFileRoute('/_authed/calendar/')({
  beforeLoad: () => {
    const today = new Date()
    const formattedDate = formatDate(today, 'PARTIAL')
    console.log(formattedDate)
    throw redirect({ to: '/calendar/$date', params: { date: formattedDate } })
  },
})
