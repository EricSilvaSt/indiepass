import { Home, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-bold">Página não encontrada</h2>
        <p className="mt-2 text-muted-foreground">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:opacity-90"
        >
          <Home className="h-4 w-4" /> Voltar para o início
        </Link>
      </div>
    </div>
  )
}
