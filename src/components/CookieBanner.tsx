import { useState, useEffect } from 'react'
import { X, Cookie } from 'lucide-react'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    const hasConsent = localStorage.getItem('cookieConsent')
    if (!hasConsent) {
      setIsVisible(true)
    } else {
      setPreferences(JSON.parse(hasConsent))
    }
  }, [])

  const handleAcceptAll = () => {
    const newPreferences = { necessary: true, analytics: true, marketing: true }
    setPreferences(newPreferences)
    localStorage.setItem('cookieConsent', JSON.stringify(newPreferences))
    setIsVisible(false)
  }

  const handleAcceptSelected = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences))
    setIsVisible(false)
  }

  const handleRejectAll = () => {
    const newPreferences = { necessary: true, analytics: false, marketing: false }
    setPreferences(newPreferences)
    localStorage.setItem('cookieConsent', JSON.stringify(newPreferences))
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background p-4 shadow-lg">
      <div className="mx-auto max-w-6xl">
        {!showSettings ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Cookie className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Este site usa cookies</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Usamos cookies para melhorar sua experiência e analisar o uso do site. Ao continuar navegando, você concorda com nossa política de cookies.
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowSettings(true)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                Configurar
              </button>
              <button
                onClick={handleRejectAll}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                Apenas necessários
              </button>
              <button
                onClick={handleAcceptAll}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
              >
                Aceitar todos
              </button>
            </div>
          </div>
        ) : (
          <div className="card-surface p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" /> Configurações de Cookies
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-lg p-1 hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Cookies Necessários</p>
                  <p className="text-xs text-muted-foreground">Essenciais para o funcionamento do site</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  className="h-4 w-4 rounded border-border"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Cookies de Análise</p>
                  <p className="text-xs text-muted-foreground">Nos ajudam a melhorar o site</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Cookies de Marketing</p>
                  <p className="text-xs text-muted-foreground">Usados para personalizar anúncios</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={handleRejectAll}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                Rejeitar todos
              </button>
              <button
                onClick={handleAcceptSelected}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
              >
                Salvar preferências
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
