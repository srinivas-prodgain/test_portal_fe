import { redirect } from 'next/navigation'

const home_route = '/form1'

export default function Home(): never {
  redirect(home_route)
}
