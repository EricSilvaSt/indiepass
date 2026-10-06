import { Link, NavLink, useLocation } from 'react-router-dom'
import { Ticket, LayoutDashboard, Search, LogIn, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'

const links = [
  { to: '/', label: 'Explorar', icon: Search },
  { to: '/meus-ingressos', label: 'Meus ingressos', icon: Ticket },
  { to: '/produtor', label: 'Sou produtor', icon: LayoutDashboard },
]

export function Header() {
  const { pathname } = useLocation()
  const { user, profile, signOut } = useAuth()
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/indiepass.jpg" alt="IndiePass" className="h-9 w-9 rounded-full object-cover" />
            <span className="font-display text-lg font-extrabold tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
              IndiePass
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/perfil"
                  className="hidden max-w-[160px] truncate text-sm font-semibold text-muted-foreground hover:text-foreground md:inline"
                >
                  {profile?.full_name || user.email}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </>
            ) : (
              <Link
                to="/entrar"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-semibold transition hover:bg-secondary"
              >
                <LogIn className="h-4 w-4" />
                Entrar
              </Link>
            )}
            <Link
              to="/produtor/novo-evento"
              className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 md:inline-flex"
            >
              Publicar evento
            </Link>
          </div>
        </div>
      </header>

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-4 left-4 right-4 z-40 grid grid-cols-3 rounded-2xl border border-border/50 bg-background/60 backdrop-blur-md shadow-lg md:hidden">
        {links.map((l) => {
          const active = l.to === '/' ? pathname === '/' : pathname.startsWith(l.to)
          return (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                'flex flex-col items-center gap-1 py-3 text-[11px] font-semibold transition rounded-xl',
                active ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-white/5',
              )}
            >
              <l.icon className="h-5 w-5" />
              {l.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
