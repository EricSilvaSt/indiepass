import { Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" /> Política de Privacidade
        </h1>
        <p className="mt-2 text-muted-foreground">
          Última atualização: Outubro de 2026
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">1. Coleta de Informações</h2>
          <p className="text-muted-foreground mb-4">
            O IndiePass coleta as seguintes informações:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>Informações de conta:</strong> Nome, e-mail, CPF, telefone</li>
            <li><strong>Informações de endereço:</strong> Rua, número, cidade, estado, CEP</li>
            <li><strong>Informações de pagamento:</strong> Dados processados de forma segura (não armazenamos dados completos de cartão)</li>
            <li><strong>Informações de uso:</strong> Eventos visualizados, compras realizadas, histórico de navegação</li>
            <li><strong>Cookies:</strong> Dados de navegação para melhorar a experiência do usuário</li>
          </ul>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">2. Uso das Informações</h2>
          <p className="text-muted-foreground mb-4">
            Utilizamos suas informações para:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Processar e entregar suas compras de ingressos</li>
            <li>Enviar confirmações e atualizações sobre seus ingressos</li>
            <li>Personalizar sua experiência no IndiePass</li>
            <li>Melhorar nossos serviços e recursos</li>
            <li>Comunicar sobre novidades e promoções (com seu consentimento)</li>
            <li>Prevenir fraudes e proteger a segurança da plataforma</li>
          </ul>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">3. Compartilhamento de Informações</h2>
          <p className="text-muted-foreground mb-4">
            Não vendemos suas informações pessoais. Compartilhamos dados apenas:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>Com produtores de eventos:</strong> Seu nome e informações do ingresso necessárias para check-in</li>
            <li><strong>Com processadores de pagamento:</strong> Dados necessários para processar pagamentos de forma segura</li>
            <li><strong>Por exigência legal:</strong> Quando obrigado por lei ou autoridade competente</li>
            <li><strong>Com parceiros de negócios:</strong> Com sua permissão explícita</li>
          </ul>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">4. Cookies</h2>
          <p className="text-muted-foreground mb-4">
            Usamos cookies para:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Lembrar suas preferências e configurações</li>
            <li>Manter você conectado à sua conta</li>
            <li>Analizar o uso da plataforma para melhorias</li>
            <li>Personalizar conteúdo e anúncios</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
          </p>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">5. Segurança de Dados</h2>
          <p className="text-muted-foreground mb-4">
            Implementamos medidas de segurança robustas para proteger suas informações:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Criptografia SSL/TLS para todas as transmissões de dados</li>
            <li>Criptografia de dados sensíveis em repouso</li>
            <li>Autenticação segura e proteção de contas</li>
            <li>Monitoramento contínuo de segurança</li>
            <li>Conformidade com LGPD (Lei Geral de Proteção de Dados)</li>
          </ul>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">6. Seus Direitos</h2>
          <p className="text-muted-foreground mb-4">
            Você tem o direito de:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Acessar suas informações pessoais</li>
            <li>Corrigir informações incompletas ou incorretas</li>
            <li>Solicitar exclusão de seus dados (quando aplicável)</li>
            <li>Revogar consentimento para uso de dados</li>
            <li>Opor-se ao processamento de seus dados</li>
            <li>Solicitar portabilidade de seus dados</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Para exercer esses direitos, entre em contato conosco através do e-mail:
            <a href="mailto:privacidade@indiepass.com" className="text-primary ml-1">privacidade@indiepass.com</a>
          </p>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">7. Retenção de Dados</h2>
          <p className="text-muted-foreground">
            Mantemos suas informações pelo tempo necessário para fornecer nossos serviços e cumprir obrigações legais. Após esse período, seus dados são excluídos ou anonimizados de forma segura.
          </p>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">8. Menores de Idade</h2>
          <p className="text-muted-foreground">
            O IndiePass não é destinado a menores de 16 anos. Não coletamos intencionalmente informações de menores. Se descobrirmos que coletamos dados de um menor, tomaremos medidas para excluí-los imediatamente.
          </p>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">9. Alterações na Política</h2>
          <p className="text-muted-foreground">
            Podemos atualizar esta política de privacidade periodicamente. Notificaremos você sobre alterações significativas através de e-mail ou aviso na plataforma.
          </p>
        </section>

        <section className="card-surface p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">10. Contato</h2>
          <p className="text-muted-foreground">
            Para dúvidas sobre esta política de privacidade ou exercer seus direitos, entre em contato:
            <a href="mailto:privacidade@indiepass.com" className="text-primary ml-1">privacidade@indiepass.com</a>
          </p>
        </section>
      </div>
    </div>
  )
}
