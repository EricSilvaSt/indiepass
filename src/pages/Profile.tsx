import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/auth'
import { RequireAuth } from '@/components/RequireAuth'

const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Informe seu nome completo').max(100),
  whatsapp: z.string().trim().max(20),
  cpf: z.string().trim().min(11, 'CPF inválido').max(14),
  address_street: z.string().trim().min(1, 'Informe o endereço').max(100),
  address_number: z.string().trim().min(1, 'Informe o número').max(20),
  address_city: z.string().trim().min(1, 'Informe a cidade').max(50),
  address_state: z.string().trim().min(2, 'UF inválida').max(2),
  address_zip: z.string().trim().min(8, 'CEP inválido').max(9),
})

export default function Profile() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    full_name: '',
    whatsapp: '',
    cpf: '',
    address_street: '',
    address_number: '',
    address_city: '',
    address_state: '',
    address_zip: '',
  })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        whatsapp: profile.whatsapp || '',
        cpf: profile.cpf || '',
        address_street: profile.address_street || '',
        address_number: profile.address_number || '',
        address_city: profile.address_city || '',
        address_state: profile.address_state || '',
        address_zip: profile.address_zip || '',
      })
    }
  }, [profile])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const parsed = profileSchema.safeParse(form)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message)
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: parsed.data.full_name,
          whatsapp: parsed.data.whatsapp,
          cpf: parsed.data.cpf,
          address_street: parsed.data.address_street,
          address_number: parsed.data.address_number,
          address_city: parsed.data.address_city,
          address_state: parsed.data.address_state,
          address_zip: parsed.data.address_zip,
        })
        .eq('id', user?.id)

      if (error) throw error

      await refreshProfile()
      toast.success('Perfil atualizado com sucesso!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Algo deu errado'
      const errorMap: Record<string, string> = {
        'duplicate key': 'Este e-mail já está cadastrado.',
        'null violation': 'Preencha todos os campos obrigatórios.',
        'string too long': 'Este campo é muito longo.',
      }

      let errorMessage = errorMap[msg] || msg
      toast.error(errorMessage)
    } finally {
      setBusy(false)
    }
  }

  return (
    <RequireAuth>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Sora, sans-serif' }}>
            Meu Perfil
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Atualize suas informações pessoais
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card-surface p-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Nome completo</label>
              <input
                className="field"
                placeholder="Seu nome completo"
                value={form.full_name}
                onChange={set('full_name')}
                disabled={busy}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">WhatsApp</label>
              <input
                className="field"
                placeholder="(11) 99999-9999"
                value={form.whatsapp}
                onChange={set('whatsapp')}
                disabled={busy}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">CPF</label>
              <input
                className="field"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={set('cpf')}
                disabled={busy}
              />
            </div>
          </div>

          <div className="card-surface p-5 space-y-4">
            <h2 className="text-lg font-bold">Endereço</h2>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Rua</label>
              <input
                className="field"
                placeholder="Nome da rua"
                value={form.address_street}
                onChange={set('address_street')}
                disabled={busy}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Número</label>
              <input
                className="field"
                placeholder="123"
                value={form.address_number}
                onChange={set('address_number')}
                disabled={busy}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Cidade</label>
              <input
                className="field"
                placeholder="São Paulo"
                value={form.address_city}
                onChange={set('address_city')}
                disabled={busy}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Estado</label>
                <input
                  className="field"
                  placeholder="SP"
                  value={form.address_state}
                  onChange={set('address_state')}
                  disabled={busy}
                  maxLength={2}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold">CEP</label>
                <input
                  className="field"
                  placeholder="00000-000"
                  value={form.address_zip}
                  onChange={set('address_zip')}
                  disabled={busy}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </RequireAuth>
  )
}
