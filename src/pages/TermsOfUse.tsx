import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TermsOfUse() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" /> Termos de Uso
        </h1>
        <p className="mt-2 text-muted-foreground">
          Última atualização: Outubro de 2026
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">1. Aceitação dos Termos</h2>
          <p className="text-muted-foreground">
            Ao acessar e usar o IndiePass, você concorda com estes Termos de Uso. Se você não concordar com qualquer parte destes termos, por favor, não use nossa plataforma.
          </p>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">2. Descrição do Serviço</h2>
          <p className="text-muted-foreground mb-4">
            O IndiePass é uma plataforma de venda de ingressos para eventos independentes que permite:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Compradores visualizarem e comprarem ingressos para eventos</li>
            <li>Produtores criarem e gerenciarem seus eventos</li>
            <li>Processamento de pagamentos seguro</li>
            <li>Emissão de ingressos digitais com QR Code</li>
            <li>Sistema de check-in automatizado</li>
          </ul>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">3. Cadastro e Conta</h2>
          <p className="text-muted-foreground mb-4">
            Para usar o IndiePass, você deve criar uma conta e fornecer informações verdadeiras e completas. Você é responsável por:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Manter a segurança de sua senha e conta</li>
            <li>Notificar o IndiePass imediatamente sobre qualquer uso não autorizado</li>
            <li>Responsabilizar-se por todas as atividades que ocorrem em sua conta</li>
          </ul>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">4. Compra de Ingressos</h2>
          <p className="text-muted-foreground mb-4">
            Ao comprar ingressos no IndiePass, você concorda que:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Os ingressos são pessoais e intransferíveis</li>
            <li>Você deve fornecer informações corretas para emissão do ingresso</li>
            <li>Após a compra, não há devolução, exceto nos casos previstos na política de cancelamento</li>
            <li>O IndiePass não é responsável por eventos cancelados pelos produtores</li>
          </ul>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">5. Política de Cancelamento</h2>
          <p className="text-muted-foreground mb-4">
            Você pode solicitar cancelamento do ingresso se:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>O pedido foi feito há menos de 7 dias</li>
            <li>Faltam mais de 48 horas para o início do evento</li>
            <li>O ingresso ainda não foi utilizado</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            O reembolso será processado automaticamente de acordo com a forma de pagamento original.
          </p>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">6. Taxas e Pagamentos</h2>
          <p className="text-muted-foreground mb-4">
            O IndiePass cobra uma taxa de serviço de 10% sobre cada venda. Esta taxa é aplicada sobre o valor total do ingresso.
          </p>
          <p className="text-muted-foreground">
            Para produtores, não há taxas de cadastro ou mensalidades. A taxa é cobrada apenas quando há vendas.
          </p>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">7. Responsabilidades do Produtor</h2>
          <p className="text-muted-foreground mb-4">
            Ao criar eventos no IndiePass, o produtor concorda em:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Fornecer informações verdadeiras sobre o evento</li>
            <li>Realizar o evento conforme anunciado</li>
            <li>Honrar todos os ingressos vendidos</li>
            <li>Notificar o IndiePass sobre cancelamentos ou alterações</li>
            <li>Respeitar as políticas de pagamento e reembolso</li>
          </ul>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">8. Propriedade Intelectual</h2>
          <p className="text-muted-foreground">
            Todo o conteúdo do IndiePass, incluindo textos, imagens, logos e design, é protegido por direitos autorais. Você não pode copiar, modificar ou usar este conteúdo sem permissão.
          </p>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">9. Limitação de Responsabilidade</h2>
          <p className="text-muted-foreground">
            O IndiePass não é responsável por danos diretos, indiretos, incidentais ou consequentes resultantes do uso da plataforma. Não garantimos que o serviço será ininterrupto ou livre de erros.
          </p>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">10. Alterações nos Termos</h2>
          <p className="text-muted-foreground">
            O IndiePass reserva-se o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação. O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.
          </p>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">11. Contato</h2>
          <p className="text-muted-foreground">
            Para dúvidas sobre estes Termos de Uso, entre em contato através do e-mail:
            <a href="mailto:legal@indiepass.com" className="text-primary ml-1">legal@indiepass.com</a>
          </p>
        </section>
      </div>
    </div>
  )
}
