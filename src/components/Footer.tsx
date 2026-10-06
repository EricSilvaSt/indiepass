import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="ink-surface mt-12">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Mobile layout - centered */}
        <div className="text-center sm:hidden mb-6">
          <img src="/indiepass.jpg" alt="IndiePass" className="h-14 w-14 rounded-full object-cover mx-auto mb-3" />
          <p className="text-xs text-white/70">
            A plataforma de ingressos para a cena independente.
          </p>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-4">
            <img src="/indiepass.jpg" alt="IndiePass" className="h-16 w-16 rounded-full object-cover shrink-0" />
            <div>
              <p className="text-sm text-white/70">
                A plataforma de ingressos para a cena independente.
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">IndiePass</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/" className="hover:text-white">Eventos</Link></li>
              <li><Link to="/meus-ingressos" className="hover:text-white">Meus ingressos</Link></li>
              <li><Link to="/produtor" className="hover:text-white">Para produtores</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/ajuda" className="hover:text-white">Central de ajuda</Link></li>
              <li><Link to="/termos" className="hover:text-white">Termos de uso</Link></li>
              <li><Link to="/privacidade" className="hover:text-white">Privacidade</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Redes sociais</h4>
            <div className="flex gap-3">
              <a href="#" className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/20 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/20 transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/20 transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/20 transition">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Mobile navigation links */}
        <div className="grid grid-cols-2 gap-4 sm:hidden mb-6">
          <div>
            <h4 className="font-bold text-white mb-2 text-xs">IndiePass</h4>
            <ul className="space-y-1.5 text-xs text-white/70">
              <li><Link to="/" className="hover:text-white">Eventos</Link></li>
              <li><Link to="/meus-ingressos" className="hover:text-white">Meus ingressos</Link></li>
              <li><Link to="/produtor" className="hover:text-white">Para produtores</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-2 text-xs">Suporte</h4>
            <ul className="space-y-1.5 text-xs text-white/70">
              <li><Link to="/ajuda" className="hover:text-white">Central de ajuda</Link></li>
              <li><Link to="/termos" className="hover:text-white">Termos de uso</Link></li>
              <li><Link to="/privacidade" className="hover:text-white">Privacidade</Link></li>
            </ul>
          </div>
        </div>

        {/* Mobile social icons */}
        <div className="flex justify-center gap-3 sm:hidden mb-6">
          <a href="#" className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition">
            <Facebook className="h-4 w-4" />
          </a>
          <a href="#" className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition">
            <Instagram className="h-4 w-4" />
          </a>
          <a href="#" className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition">
            <Twitter className="h-4 w-4" />
          </a>
          <a href="#" className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition">
            <Youtube className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-6 sm:mt-8 border-t border-white/10 pt-4 sm:pt-8 text-center text-xs sm:text-sm text-white/50">
          <p>© 2026 IndiePass — Powered by ER.IA</p>
        </div>
      </div>
    </footer>
  )
}
