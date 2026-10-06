import { Navigate, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuth } from '@/lib/auth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground">Carregando…</div>
  }

  if (!user) {
    return <Navigate to={`/entrar?next=${encodeURIComponent(pathname)}`} replace />
  }

  return <>{children}</>
}
