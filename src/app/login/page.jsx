import { login, signup } from './actions'
import { MonitorPlay } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-900/30 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
      
      <div className="glass-card w-full max-w-md p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mb-4 border border-primary-500/30">
            <MonitorPlay className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground text-center">SIM-IFP</h1>
          <p className="text-sm text-zinc-400 mt-2 text-center">
            Sistem Informasi Manajemen Terpadu Lab IFP
          </p>
        </div>

        <form className="flex flex-col space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-surface-hover border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              placeholder="guru@sekolah.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full bg-surface-hover border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4 flex flex-col space-y-3">
            <button
              formAction={login}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-primary-900/20"
            >
              Log In
            </button>
            <button
              formAction={signup}
              className="w-full bg-transparent border border-border hover:bg-surface-hover text-zinc-300 font-medium py-2.5 rounded-lg transition-colors"
            >
              Daftar Baru
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
