import { redirect } from 'next/navigation'

const homeRoute = '/form1'

export default function Home() {
  redirect(homeRoute)
}
