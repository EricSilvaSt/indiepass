export type Category = 'Show' | 'Festa' | 'Teatro' | 'Feira' | 'Workshop'

export const CATEGORIES: Category[] = ['Show', 'Festa', 'Teatro', 'Feira', 'Workshop']

export const BRAZILIAN_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
]

export const MAJOR_CITIES: Record<string, string[]> = {
  'SP': ['São Paulo', 'Campinas', 'Santos', 'São Bernardo do Campo', 'Guarulhos', 'Sorocaba', 'Ribeirão Preto', 'Osasco', 'São José dos Campos', 'Santo André'],
  'RJ': ['Rio de Janeiro', 'Niterói', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Belford Roxo', 'São João de Meriti', 'Campos dos Goytacazes', 'Petrópolis', 'Volta Redonda'],
  'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga'],
  'RS': ['Porto Alegre', 'Caxias do Sul', 'Canoas', 'Pelotas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Alvorada'],
  'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá'],
  'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma', 'Lages', 'Itajaí', 'Jaraguá do Sul', 'Chapecó', 'Tubarão'],
  'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna', 'Juazeiro', 'Jequié', 'Ilhéus', 'Barreiras', 'Porto Seguro'],
  'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Vitória de Santo Antão', 'Igarassu'],
  'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Quixadá', 'Canindé', 'Pacatuba'],
  'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Valparaíso de Goiás', 'Catalão', 'Itumbiara', 'Jataí', 'Caldas Novas'],
  'DF': ['Brasília', 'Ceilândia', 'Taguatinga', 'Samambaia', 'Planaltina', 'Sobradinho', 'Gama', 'Recanto das Emas', 'Santa Maria', 'Águas Claras'],
  'ES': ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Viana', 'Cachoeiro de Itapemirim', 'Linhares', 'São Mateus', 'Colatina', 'Guarapari'],
  'AM': ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tefé', 'Maués', 'Tabatinga', 'Boa Vista do Ramos', 'Eirunepé'],
  'PA': ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Castanhal', 'Parauapebas', 'Abaetetuba', 'Cametá', 'Bragança', 'Altamira'],
  'MA': ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Codó', 'Paço do Lumiar', 'Bacabal', 'Balsas', 'Pinheiro'],
  'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Pombal', 'Guarabira', 'Cabedelo', 'Esperança'],
  'RN': ['Natal', 'Mossoró', 'Parnamirim', 'Macaíba', 'Caicó', 'São Gonçalo do Amarante', 'Ceará-Mirim', 'Touros', 'Extremoz', 'São Gonçalo do Amarante'],
  'AL': ['Maceió', 'Arapiraca', 'Marechal Deodoro', 'Delmiro Gouveia', 'Palmeira dos Índios', 'União dos Palmares', 'Rio Largo', 'Coruripe', 'Penedo', 'Porto Calvo'],
  'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'Estância', 'Tobias Barreto', 'Simão Dias', 'Poco Redondo', 'Boquim', 'Itabaianinha'],
  'PI': ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 'Barras', 'Corrente', 'Altos', 'Oeiras', 'São Raimundo Nonato'],
  'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Sorriso', 'Lucas do Rio Verde', 'Primavera do Leste', 'Alta Floresta', 'Barra do Garças'],
  'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Aquidauana', 'Navira', 'Nova Andradina', 'Bela Vista', 'Sidrolândia'],
  'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal', 'Jaru', 'Ouro Preto do Oeste', 'Buritis', 'Machadinho d\'Oeste', 'Espigão d\'Oeste'],
  'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó', 'Boca do Acre', 'Epitaciolândia', 'Rodrigues Alves', 'Plácido de Castro', 'Xapuri'],
  'RR': ['Boa Vista', 'Caracaraí', 'Pacaraima', 'Cantá', 'Rorainópolis', 'Mucajaí', 'Uiramutã', 'Normandia', 'Pessoa Física', 'São João da Baliza'],
  'AP': ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Porto Grande', 'Mazagão', 'Ferreira Gomes', 'Vitória do Jari', 'Pedra Branca do Amapari', 'Amapá'],
  'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Araguatins', 'Colinas do Tocantins', 'Guaraí', 'Dianópolis', 'Miracema do Tocantins'],
}

export interface TicketType {
  id: string
  eventId: string
  name: string
  price: number
  quantity: number
  sold: number
}

export interface EventItem {
  id: string
  title: string
  description: string
  category: Category
  image: string
  date: string // ISO
  venue: string
  address: string
  city: string
  organizer: string
  ticketTypes: TicketType[]
}

export interface Reservation {
  id: string
  eventId: string
  items: { ticketTypeId: string; qty: number }[]
  expiresAt: number
}

export interface Buyer {
  name: string
  email: string
  cpf: string
  whatsapp: string
}

export type PaymentMethod = 'pix' | 'card'

export interface Ticket {
  id: string
  code: string
  orderId: string
  eventId: string
  ticketTypeId: string
  holder: string
  checkedInAt: number | null
}

export interface Order {
  id: string
  eventId: string
  buyer: Buyer
  items: { ticketTypeId: string; qty: number }[]
  subtotal: number
  fee: number
  total: number
  payment: PaymentMethod
  status: 'paid'
  createdAt: number
  ticketIds: string[]
}

export const SERVICE_FEE_RATE = 0.1

export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
