import { redirect } from 'next/navigation'

export default function Home() {
  // Langsung arahkan halaman utama ke dashboard
  // Jika belum login, middleware otomatis akan melemparnya ke halaman /login
  redirect('/dashboard')
}
