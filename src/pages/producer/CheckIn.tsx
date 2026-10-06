import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, CheckCircle2, XCircle } from 'lucide-react'
import { useStore } from '@/lib/store'

export default function CheckIn() {
  const { checkIn, db, getEvent } = useStore()
  const [code, setCode] = useState('')
  const [result, setResult] = useState<{ ok: boolean; message: string; detail?: string } | null>(null)
  const [camera, setCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const validate = (value: string) => {
    const res = checkIn(value)
    const event = res.ticket ? getEvent(res.ticket.eventId) : undefined
    setResult({
      ok: res.ok,
      message: res.message,
      detail: res.ticket ? `${res.ticket.holder} · ${event?.title ?? ''}` : undefined,
    })
    setCode('')
  }

  useEffect(() => {
    if (!camera) {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      return
    }
    let cancelled = false
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (cancelled) return stream.getTracks().forEach((t) => t.stop())
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => setCamera(false))
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [camera])

  const pending = db.tickets.filter((t) => !t.checkedInAt).length
  const done = db.tickets.length - pending

  return (
    <div className="mx-auto max-w-xl px-4 py-8 pb-28 sm:px-6">
      <h1 className="text-2xl font-extrabold">Validação de entrada</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Aponte a câmera para o QR Code do participante ou digite o código do ingresso.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="card-surface p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Check-ins</p>
          <p className="text-2xl font-extrabold text-accent">{done}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Pendentes</p>
          <p className="text-2xl font-extrabold">{pending}</p>
        </div>
      </div>

      <div className="card-surface mt-4 overflow-hidden">
        <div className="relative grid aspect-video place-items-center bg-secondary text-white/60">
          {camera ? (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          ) : (
            <p className="text-sm">Câmera desativada</p>
          )}
          <div className="pointer-events-none absolute inset-10 rounded-2xl border-2 border-dashed border-white/40" />
        </div>
        <button
          onClick={() => setCamera((c) => !c)}
          className="flex w-full items-center justify-center gap-2 border-t border-border py-3 text-sm font-semibold"
        >
          {camera ? <><CameraOff className="h-4 w-4" /> Desligar câmera</> : <><Camera className="h-4 w-4" /> Ligar câmera</>}
        </button>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); if (code.trim()) validate(code) }}
        className="mt-4 flex gap-2"
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código do ingresso (ex: A1B2C3-D4E5)"
          className="field font-mono uppercase"
          maxLength={20}
        />
        <button type="submit" className="rounded-xl bg-primary px-5 font-bold text-primary-foreground">
          Validar
        </button>
      </form>

      {result && (
        <div className={`mt-4 flex items-start gap-3 rounded-xl p-4 ${result.ok ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
          {result.ok ? <CheckCircle2 className="mt-0.5 h-5 w-5" /> : <XCircle className="mt-0.5 h-5 w-5" />}
          <div>
            <p className="font-bold">{result.message}</p>
            {result.detail && <p className="text-sm opacity-90">{result.detail}</p>}
          </div>
        </div>
      )}

      {db.tickets.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-bold">Ingressos emitidos</h2>
          <ul className="card-surface divide-y divide-border">
            {db.tickets.slice(0, 12).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span className="font-mono">{t.code}</span>
                <span className="truncate text-muted-foreground">{t.holder}</span>
                <button
                  onClick={() => validate(t.code)}
                  disabled={!!t.checkedInAt}
                  className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-semibold disabled:opacity-40"
                >
                  {t.checkedInAt ? 'Validado' : 'Check-in'}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
