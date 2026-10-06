import { HelpCircle, Search, ChevronRight, Phone, Mail, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const faqCategories = [
  {
    title: 'Compras e Pagamentos',
    icon: '💳',
    questions: [
      {
        q: 'Como comprar ingressos?',
        a: 'Selecione o evento desejado, escolha a quantidade de ingressos e finalize o pagamento com Pix ou cartão de crédito. Você receberá o ingresso digital por e-mail.'
      },
      {
        q: 'Quais formas de pagamento aceitas?',
        a: 'Aceitamos Pix e cartões de crédito (Visa, Mastercard, Elo, American Express). O pagamento é processado de forma segura.'
      },
      {
        q: 'Posso dividir o pagamento?',
        a: 'Para compras com cartão de crédito, oferecemos parcelamento em até 12x sem juros, dependendo do valor da compra.'
      },
      {
        q: 'Onde encontro meus ingressos?',
        a: 'Após a compra, seus ingressos ficam disponíveis na aba "Meus Ingressos" do IndiePass. Você também recebe um e-mail de confirmação.'
      }
    ]
  },
  {
    title: 'Cancelamentos e Reembolsos',
    icon: '🔄',
    questions: [
      {
        q: 'Posso cancelar meu ingresso?',
        a: 'Sim, você pode solicitar cancelamento até 7 dias após a compra e desde que faltem mais de 48 horas para o início do evento.'
      },
      {
        q: 'Como solicito o reembolso?',
        a: 'Acesse "Meus Ingressos", clique em "Solicitar cancelamento" no ingresso desejado. O reembolso será processado automaticamente.'
      },
      {
        q: 'Quanto tempo demora o reembolso?',
        a: 'Para pagamentos com Pix, o reembolso é processado em até 24 horas. Para cartões de crédito, pode levar de 5 a 10 dias úteis.'
      },
      {
        q: 'Em quais casos não posso cancelar?',
        a: 'Não é possível cancelar se o evento já começou, se faltam menos de 48 horas para o início, ou se o pedido foi feito há mais de 7 dias.'
      }
    ]
  },
  {
    title: 'Para Produtores',
    icon: '🎪',
    questions: [
      {
        q: 'Como faço para criar um evento?',
        a: 'Crie uma conta no IndiePass, acesse o painel do produtor e clique em "Criar evento". Preencha as informações, defina os tipos de ingresso e publique!'
      },
      {
        q: 'Quanto custa usar o IndiePass?',
        a: 'O IndiePass cobra uma taxa de 10% sobre cada venda. Não há taxas de cadastro ou mensalidades.'
      },
      {
        q: 'Como recebo o dinheiro das vendas?',
        a: 'Configure seus dados bancários no perfil de produtor. Os pagamentos são transferidos semanalmente.'
      },
      {
        q: 'Posso criar eventos gratuitos?',
        a: 'Sim! Você pode criar eventos gratuitos. A taxa de 10% não é aplicada a eventos sem custo.'
      }
    ]
  },
  {
    title: 'Ingressos e Check-in',
    icon: '🎫',
    questions: [
      {
        q: 'Como funciona o check-in?',
        a: 'No dia do evento, apresente o QR Code do seu ingresso na entrada. O produtor validará o código automaticamente.'
      },
      {
        q: 'Posso transferir meu ingresso?',
        a: 'Atualmente não é possível transferir ingressos. Cada ingresso é pessoal e intransferível.'
      },
      {
        q: 'O que acontece se perder meu ingresso?',
        a: 'Não se preocupe! Seus ingressos ficam salvos na sua conta do IndiePass. Basta acessar "Meus Ingressos" para ver todos.'
      },
      {
        q: 'Preciso imprimir o ingresso?',
        a: 'Não! O QR Code digital é suficiente. Mas você pode imprimir se preferir.'
      }
    ]
  }
]

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

  const filteredQuestions = faqCategories.flatMap((category, catIndex) =>
    category.questions
      .filter((q) =>
        q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.a.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((q) => ({ ...q, category: category.title, icon: category.icon }))
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-primary" /> Central de Ajuda
        </h1>
        <p className="mt-2 text-muted-foreground">
          Encontre respostas para as perguntas mais frequentes sobre o IndiePass.
        </p>
      </div>

      {/* Busca */}
      <div className="mb-8 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Busque por palavras-chave..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="field pl-9"
        />
      </div>

      {/* Contato */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card-surface p-4 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-primary mb-2" />
          <h3 className="font-bold">Chat ao vivo</h3>
          <p className="text-sm text-muted-foreground mt-1">Horário: Seg-Sex, 9h-18h</p>
        </div>
        <div className="card-surface p-4 text-center">
          <Mail className="mx-auto h-8 w-8 text-primary mb-2" />
          <h3 className="font-bold">E-mail</h3>
          <p className="text-sm text-muted-foreground mt-1">suporte@indiepass.com</p>
        </div>
        <div className="card-surface p-4 text-center">
          <Phone className="mx-auto h-8 w-8 text-primary mb-2" />
          <h3 className="font-bold">Telefone</h3>
          <p className="text-sm text-muted-foreground mt-1">(11) 4000-0000</p>
        </div>
      </div>

      {/* FAQ por categoria */}
      {!searchTerm && (
        <div className="space-y-4">
          {faqCategories.map((category, catIndex) => (
            <div key={catIndex} className="card-surface">
              <button
                onClick={() => setExpandedCategory(expandedCategory === catIndex ? null : catIndex)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <span className="font-bold">{category.title}</span>
                </div>
                <ChevronRight
                  className={`h-5 w-5 transition-transform ${
                    expandedCategory === catIndex ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {expandedCategory === catIndex && (
                <div className="border-t border-border p-4 space-y-4">
                  {category.questions.map((item, qIndex) => (
                    <div key={qIndex}>
                      <button
                        onClick={() => setExpandedQuestion(expandedQuestion === qIndex ? null : qIndex)}
                        className="w-full text-left font-semibold text-primary"
                      >
                        {item.q}
                      </button>
                      {expandedQuestion === qIndex && (
                        <p className="mt-2 text-muted-foreground">{item.a}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resultados da busca */}
      {searchTerm && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">
            {filteredQuestions.length} resultado{filteredQuestions.length !== 1 ? 's' : ''} encontrado{filteredQuestions.length !== 1 ? 's' : ''}
          </h2>
          {filteredQuestions.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma pergunta encontrada com esse termo.</p>
          ) : (
            filteredQuestions.map((item, index) => (
              <div key={index} className="card-surface p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {item.icon} {item.category}
                </p>
                <h3 className="font-bold">{item.q}</h3>
                <p className="mt-2 text-muted-foreground">{item.a}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Ainda precisa de ajuda? */}
      <div className="mt-8 card-surface p-6 text-center">
        <h3 className="font-bold text-lg">Ainda precisa de ajuda?</h3>
        <p className="mt-2 text-muted-foreground">
          Entre em contato com nossa equipe de suporte através do chat, e-mail ou telefone.
        </p>
        <Link
          to="/contato"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:opacity-90"
        >
          Falar com suporte <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
