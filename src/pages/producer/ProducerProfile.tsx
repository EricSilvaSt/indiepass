import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/auth'
import { RequireAuth } from '@/components/RequireAuth'

const producerProfileSchema = z.object({
  legal_type: z.enum(['cpf', 'cnpj']),
  doc_number: z.string().trim().min(11, 'Documento inválido').max(18),
  legal_name: z.string().trim().min(2, 'Nome/Razão Social obrigatório').max(100),
  pix_key_type: z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']).optional(),
  pix_key: z.string().trim().max(100).optional(),
  bank_code: z.string().trim().min(3, 'Código do banco inválido').max(4).regex(/^\d+$/, 'Código do banco deve conter apenas números').optional(),
  agency: z.string().trim().max(10).optional(),
  account_number: z.string().trim().max(20).optional(),
  instagram: z.string().trim().max(50).optional(),
  bio: z.string().trim().max(500).optional(),
})

export default function ProducerProfile() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [form, setForm] = useState({
    legal_type: 'cpf' as 'cpf' | 'cnpj',
    doc_number: '',
    legal_name: '',
    pix_key_type: 'cpf' as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random',
    pix_key: '',
    bank_code: '',
    agency: '',
    account_number: '',
    instagram: '',
    bio: '',
  })
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducerProfile()
  }, [user])

  async function loadProducerProfile() {
    if (!user) return

    const { data, error } = await supabase
      .from('producer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error loading producer profile:', error)
    } else if (data) {
      setForm({
        legal_type: (data.legal_type as 'cpf' | 'cnpj') || 'cpf',
        doc_number: data.doc_number || '',
        legal_name: data.legal_name || '',
        pix_key_type: (data.pix_key_type as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random') || 'cpf',
        pix_key: data.pix_key || '',
        bank_code: data.bank_code || '',
        agency: data.agency || '',
        account_number: data.account_number || '',
        instagram: data.instagram || '',
        bio: data.bio || '',
      })
    }
    setLoading(false)
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const parsed = producerProfileSchema.safeParse(form)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message)
        return
      }

      const { error } = await supabase
        .from('producer_profiles')
        .upsert({
          user_id: user?.id,
          legal_type: parsed.data.legal_type,
          doc_number: parsed.data.doc_number,
          legal_name: parsed.data.legal_name,
          pix_key_type: parsed.data.pix_key_type || null,
          pix_key: parsed.data.pix_key || null,
          bank_code: parsed.data.bank_code || null,
          agency: parsed.data.agency || null,
          account_number: parsed.data.account_number || null,
          instagram: parsed.data.instagram || null,
          bio: parsed.data.bio || null,
        })

      if (error) throw error

      toast.success('Perfil de produtor atualizado com sucesso!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Algo deu errado'
      const errorMap: Record<string, string> = {
        'duplicate key': 'Este perfil já existe.',
        'null violation': 'Preencha todos os campos obrigatórios.',
        'string too long': 'Este campo é muito longo.',
      }

      let errorMessage = errorMap[msg] || msg
      toast.error(errorMessage)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <RequireAuth>
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <div className="text-center">Carregando...</div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Sora, sans-serif' }}>
            Perfil de Produtor
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure seus dados financeiros e bancários
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card-surface p-5 space-y-4">
            <h2 className="text-lg font-bold">Dados Cadastrais</h2>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Tipo de pessoa</label>
              <select
                className="field"
                value={form.legal_type}
                onChange={set('legal_type')}
                disabled={busy}
              >
                <option value="cpf">Pessoa Física (CPF)</option>
                <option value="cnpj">Pessoa Jurídica (CNPJ)</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                {form.legal_type === 'cpf' ? 'CPF' : 'CNPJ'}
              </label>
              <input
                className="field"
                placeholder={form.legal_type === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                value={form.doc_number}
                onChange={set('doc_number')}
                disabled={busy}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                {form.legal_type === 'cpf' ? 'Nome completo' : 'Razão Social'}
              </label>
              <input
                className="field"
                placeholder={form.legal_type === 'cpf' ? 'Seu nome completo' : 'Nome da empresa'}
                value={form.legal_name}
                onChange={set('legal_name')}
                disabled={busy}
              />
            </div>
          </div>

          <div className="card-surface p-5 space-y-4">
            <h2 className="text-lg font-bold">Chave Pix</h2>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Tipo de chave</label>
              <select
                className="field"
                value={form.pix_key_type}
                onChange={set('pix_key_type')}
                disabled={busy}
              >
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">E-mail</option>
                <option value="phone">Telefone</option>
                <option value="random">Chave aleatória</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Chave Pix</label>
              <input
                className="field"
                placeholder="Sua chave Pix"
                value={form.pix_key}
                onChange={set('pix_key')}
                disabled={busy}
              />
            </div>
          </div>

          <div className="card-surface p-5 space-y-4">
            <h2 className="text-lg font-bold">Dados Bancários</h2>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Código do banco</label>
              <input
                className="field"
                placeholder="Ex: 001 (Banco do Brasil)"
                value={form.bank_code}
                onChange={set('bank_code')}
                disabled={busy}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Agência</label>
              <input
                className="field"
                placeholder="Ex: 1234"
                value={form.agency}
                onChange={set('agency')}
                disabled={busy}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Número da conta</label>
              <input
                className="field"
                placeholder="Ex: 12345-6"
                value={form.account_number}
                onChange={set('account_number')}
                disabled={busy}
              />
            </div>
          </div>

          <div className="card-surface p-5 space-y-4">
            <h2 className="text-lg font-bold">Informações Adicionais</h2>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Instagram</label>
              <input
                className="field"
                placeholder="@seuinstagram"
                value={form.instagram}
                onChange={set('instagram')}
                disabled={busy}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Bio</label>
              <textarea
                className="field min-h-[100px]"
                placeholder="Conte um pouco sobre você/empresa..."
                value={form.bio}
                onChange={set('bio')}
                disabled={busy}
              />
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
