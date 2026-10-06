import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, 'Informe seu nome completo').max(100),
  email: z.string().trim().email('E-mail inválido').max(255),
  whatsapp: z.string().trim().max(20).optional().or(z.literal('')),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres').max(72),
})

const signInSchema = z.object({
  email: z.string().trim().email('E-mail inválido').max(255),
  password: z.string().min(1, 'Informe sua senha').max(72),
})

export default function Auth() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>(params.get('modo') === 'cadastro' ? 'signup' : 'signin')
  const [form, setForm] = useState({ fullName: '', email: '', whatsapp: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const next = params.get('next') || '/'

  useEffect(() => {
    if (!loading && user) navigate(next, { replace: true })
  }, [loading, user, navigate, next])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      if (mode === 'signup') {
        const parsed = signUpSchema.safeParse(form)
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message)
          return
        }
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: parsed.data.fullName, whatsapp: parsed.data.whatsapp ?? '' },
            emailConfirm: false, // Desabilitar confirmação de email
          },
        })
        if (error) throw error
        if (!data.session) {
          setSent(true)
          toast.success('Conta criada! Faça login para acessar sua conta.')
        } else {
          // Vincular ingressos históricos ao novo usuário
          await supabase.rpc('link_historical_tickets', {
            _user_id: data.user.id,
            _email: parsed.data.email
          })
          toast.success('Conta criada!')
        }
      } else {
        const parsed = signInSchema.safeParse(form)
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message)
          return
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        })
        if (error) throw error
        toast.success('Bem-vindo de volta!')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Algo deu errado'
      const errorMap: Record<string, string> = {
        'Invalid login credentials': 'E-mail ou senha incorretos.',
        'Email not confirmed': 'E-mail não confirmado. Verifique sua caixa de entrada.',
        'User already registered': 'Este e-mail já tem conta. Faça login.',
        'Password should be at least 6 characters': 'A senha precisa ter ao menos 6 caracteres.',
        'Unable to validate email address': 'E-mail inválido.',
        'Sending confirmation email failed': 'Erro ao enviar e-mail de confirmação. Tente novamente.',
        'signup_disabled': 'O cadastro está desabilitado no momento.',
      }

      let errorMessage = errorMap[msg] || msg
      toast.error(errorMessage)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 pb-24 pt-10 sm:px-6 md:pb-16">
      <div className="mb-6 flex flex-col items-center text-center">
        <img src="/indiepass.jpg" alt="IndiePass" className="h-16 w-16 rounded-full object-cover" />
        <h1 className="mt-4 text-2xl font-extrabold" style={{ fontFamily: 'Sora, sans-serif' }}>
          {mode === 'signup' ? 'Criar conta no IndiePass' : 'Entrar no IndiePass'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Acesso à cena independente</p>
      </div>

      <div className="card-surface p-5">
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1">
          {(['signin', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'rounded-lg py-2 text-sm font-semibold transition',
                mode === m ? 'bg-background shadow-sm' : 'text-muted-foreground',
              )}
            >
              {m === 'signin' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        {sent ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Enviamos um link de confirmação para <strong className="text-foreground">{form.email}</strong>. Abra seu
            e-mail para ativar a conta.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-3">
            {mode === 'signup' && (
              <>
                <input className="field" placeholder="Nome completo" value={form.fullName} onChange={set('fullName')} />
                <input className="field" placeholder="WhatsApp (opcional)" value={form.whatsapp} onChange={set('whatsapp')} />
              </>
            )}
            <input className="field" type="email" placeholder="E-mail" value={form.email} onChange={set('email')} />
            <input
              className="field"
              type="password"
              placeholder="Senha"
              value={form.password}
              onChange={set('password')}
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {mode === 'signup' ? 'Criar minha conta' : 'Entrar'}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
