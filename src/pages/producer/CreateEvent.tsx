import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImagePlus, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/auth'
import { RequireAuth } from '@/components/RequireAuth'
import { CATEGORIES, Category, BRAZILIAN_STATES, MAJOR_CITIES } from '@/lib/types'
import fallbackImg from '@/assets/event-show.jpg'

const schema = z.object({
  title: z.string().trim().min(4, 'Título muito curto').max(120),
  description: z.string().trim().min(10, 'Descreva o evento').max(1000),
  date: z.string().min(1, 'Informe data'),
  time: z.string().min(1, 'Informe horário'),
  location: z.string().trim().min(2, 'Informe o local').max(120),
  address: z.string().trim().min(5, 'Informe o endereço').max(200),
  state: z.string().min(2, 'Selecione o estado').max(2),
  city: z.string().trim().min(2, 'Selecione a cidade').max(80),
  organizer: z.string().trim().min(2, 'Informe o produtor').max(100),
})

type Lote = { name: string; price: string; quantity: string; description: string }

export default function CreateEvent() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [image, setImage] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', category: 'Show' as Category,
    date: '', time: '', location: '', address: '', state: '', city: '', organizer: '',
  })
  const [lotes, setLotes] = useState<Lote[]>([{ name: '1º Lote', price: '', quantity: '', description: '' }])

  const onImage = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.readAsDataURL(file)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = schema.safeParse(form)
    const validLotes = lotes.filter((l) => l.name.trim() && Number(l.price) >= 0 && Number(l.quantity) > 0)
    if (!parsed.success) {
      const fe: Record<string, string> = {}
      Object.entries(parsed.error.flatten().fieldErrors).forEach(([k, v]) => (fe[k] = v?.[0] ?? ''))
      setErrors(fe)
      toast.error('Confira os campos destacados')
      return
    }
    if (!validLotes.length) {
      toast.error('Cadastre pelo menos um lote de ingressos')
      return
    }
    setErrors({})
    setLoading(true)

    try {
      // Create event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          address: form.address.trim(),
          state: form.state.trim(),
          city: form.city.trim(),
          organizer: form.organizer.trim(),
          category: form.category,
          image_url: image || fallbackImg,
          date: form.date,
          time: form.time,
          producer_id: user?.id,
          status: 'published',
          fee_payer: 'buyer',
        })
        .select()
        .single()

      if (eventError) throw eventError

      // Create ticket types
      const ticketTypes = validLotes.map((l) => ({
        event_id: eventData.id,
        name: l.name.trim(),
        description: l.description.trim(),
        price: Number(l.price),
        total_quantity: Number(l.quantity),
        available_quantity: Number(l.quantity),
        batch_number: 1,
      }))

      const { error: ticketTypesError } = await supabase
        .from('ticket_types')
        .insert(ticketTypes)

      if (ticketTypesError) throw ticketTypesError

      toast.success('Evento publicado!')
      navigate(`/evento/${eventData.id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar evento'
      const errorMap: Record<string, string> = {
        'Failed to fetch': 'Erro de conexão. Verifique sua internet.',
        'duplicate key': 'Este evento já existe.',
        'null violation': 'Preencha todos os campos obrigatórios.',
        'JWT expired': 'Sessão expirada. Faça login novamente.',
      }

      let errorMessage = errorMap[msg] || msg
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const field = (key: keyof typeof form, label: string, ph: string, type = 'text') => (
    <div>
      <label htmlFor={key} className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</label>
      <input
        id={key}
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={ph}
        className="field"
        disabled={loading}
      />
      {errors[key] && <p className="mt-1 text-xs text-destructive">{errors[key]}</p>}
    </div>
  )

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl px-4 py-8 pb-28 sm:px-6">
        <h1 className="text-2xl font-extrabold">Criar evento</h1>
        <p className="mt-1 text-sm text-muted-foreground">Publique em minutos e comece a vender.</p>

        <form onSubmit={submit} className="mt-6 space-y-6">
          <div className="card-surface p-5">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Imagem de capa</label>
            <label className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/50 p-4 text-sm text-muted-foreground">
              {image ? (
                <img src={image} alt="Prévia da capa" className="max-h-48 rounded-lg object-cover" />
              ) : (
                <span className="flex items-center gap-2"><ImagePlus className="h-4 w-4" /> Enviar imagem (JPG ou PNG)</span>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onImage(e.target.files?.[0])} disabled={loading} />
            </label>
          </div>

          <fieldset className="card-surface space-y-3 p-5">
            <legend className="px-1 text-sm font-bold">Informações</legend>
            {field('title', 'Título', 'Sarau Elétrico — Vol. 8')}
            <div>
              <label htmlFor="description" className="mb-1 block text-xs font-semibold text-muted-foreground">Descrição</label>
              <textarea
                id="description"
                rows={4}
                maxLength={1000}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Conte o que rola no evento"
                className="field resize-none"
                disabled={loading}
              />
              {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description}</p>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className="mb-1 block text-xs font-semibold text-muted-foreground">Categoria</label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                  className="field"
                  disabled={loading}
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {field('date', 'Data', '', 'date')}
                {field('time', 'Horário', '20:00', 'time')}
              </div>
            </div>
            {field('organizer', 'Produtor', 'Coletivo Aurora')}
          </fieldset>

          <fieldset className="card-surface space-y-3 p-5">
            <legend className="px-1 text-sm font-bold">Local</legend>
            {field('location', 'Nome do local', 'Galpão Aurora')}
            {field('address', 'Endereço', 'Rua dos Trilhos, 420 — Mooca')}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="state" className="mb-1 block text-xs font-semibold text-muted-foreground">Estado</label>
                <select
                  id="state"
                  value={form.state}
                  onChange={(e) => {
                    setForm({ ...form, state: e.target.value, city: '' })
                  }}
                  className="field"
                  disabled={loading}
                >
                  <option value="">Selecione o estado</option>
                  {BRAZILIAN_STATES.map((state) => (
                    <option key={state.uf} value={state.uf}>{state.name} ({state.uf})</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="city" className="mb-1 block text-xs font-semibold text-muted-foreground">Cidade</label>
                <select
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="field"
                  disabled={loading || !form.state}
                >
                  <option value="">Selecione a cidade</option>
                  {form.state && MAJOR_CITIES[form.state]?.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="card-surface space-y-3 p-5">
            <legend className="px-1 text-sm font-bold">Lotes de ingressos</legend>
            {lotes.map((l, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_90px_90px_40px] items-end gap-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Nome</label>
                  <input
                    className="field" value={l.name} placeholder="1º Lote"
                    onChange={(e) => setLotes(lotes.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Preço</label>
                  <input
                    className="field px-2" inputMode="decimal" value={l.price} placeholder="40"
                    onChange={(e) => setLotes(lotes.map((x, i) => (i === idx ? { ...x, price: e.target.value } : x)))}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Qtd.</label>
                  <input
                    className="field px-2" inputMode="numeric" value={l.quantity} placeholder="100"
                    onChange={(e) => setLotes(lotes.map((x, i) => (i === idx ? { ...x, quantity: e.target.value } : x)))}
                    disabled={loading}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Remover lote"
                  onClick={() => setLotes(lotes.filter((_, i) => i !== idx))}
                  disabled={lotes.length === 1 || loading}
                  className="mb-1 grid h-10 w-10 place-items-center rounded-xl border border-border disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setLotes([...lotes, { name: '', price: '', quantity: '', description: '' }])}
              disabled={loading}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              <Plus className="h-4 w-4" /> Adicionar lote
            </button>
          </fieldset>

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-4 font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50">
            {loading ? 'Publicando...' : 'Publicar evento'}
          </button>
        </form>
      </div>
    </RequireAuth>
  )
}
