-- Configurar templates de email bonitos com as logos
-- Nota: No Supabase self-hosted, os templates de email podem ser configurados via
-- dashboard ou via API. Esta migration documenta o template ideal.

-- Template de confirmação de email
INSERT INTO indiepass.email_templates (id, subject, body_html)
VALUES (
  'confirm-signup',
  'Confirme sua conta no IndiePass',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme sua conta IndiePass</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0; }
    .logo { max-width: 120px; height: auto; margin-bottom: 20px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .powered-by { margin-top: 10px; }
    .indiepass-logo { width: 30px; height: 30px; vertical-align: middle; margin-right: 5px; }
    .eria-logo { width: 30px; height: 30px; vertical-align: middle; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://seu-dominio.com/indiepass.jpg" alt="IndiePass" class="logo">
      <h1 style="color: white; margin: 0;">Bem-vindo ao IndiePass!</h1>
    </div>
    <div class="content">
      <p>Olá {{ .User.DisplayName }},</p>
      <p>Obrigado por se cadastrar no IndiePass! A cena independente te espera.</p>
      <p>Para completar seu cadastro e começar a vender ou comprar ingressos, confirme seu e-mail clicando no botão abaixo:</p>
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Confirmar minha conta</a>
      </div>
      <p style="font-size: 12px; color: #666;">Este link expira em 24 horas.</p>
    </div>
    <div class="footer">
      <p>© 2026 IndiePass — Powered by ER.IA</p>
      <div class="powered-by">
        <img src="https://seu-dominio.com/indiepass.jpg" alt="IndiePass" class="indiepass-logo">
        <img src="https://seu-dominio.com/logo-eria.png" alt="ER.IA" class="eria-logo">
      </div>
    </div>
  </div>
</body>
</html>'
);

-- Template de email de recuperação de senha
INSERT INTO indiepass.email_templates (id, subject, body_html)
VALUES (
  'reset-password',
  'Redefina sua senha do IndiePass',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefina sua senha IndiePass</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0; }
    .logo { max-width: 120px; height: auto; margin-bottom: 20px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .powered-by { margin-top: 10px; }
    .indiepass-logo { width: 30px; height: 30px; vertical-align: middle; margin-right: 5px; }
    .eria-logo { width: 30px; height: 30px; vertical-align: middle; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://seu-dominio.com/indiepass.jpg" alt="IndiePass" class="logo">
      <h1 style="color: white; margin: 0;">Redefina sua senha</h1>
    </div>
    <div class="content">
      <p>Olá,</p>
      <p>Recebemos uma solicitação para redefinir sua senha no IndiePass.</p>
      <p>Para continuar, clique no botão abaixo:</p>
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Redefinir minha senha</a>
      </div>
      <p style="font-size: 12px; color: #666;">Este link expira em 1 hora.</p>
      <p style="font-size: 12px; color: #666;">Se você não solicitou esta alteração, ignore este e-mail.</p>
    </div>
    <div class="footer">
      <p>© 2026 IndiePass — Powered by ER.IA</p>
      <div class="powered-by">
        <img src="https://seu-dominio.com/indiepass.jpg" alt="IndiePass" class="indiepass-logo">
        <img src="https://seu-dominio.com/logo-eria.png" alt="ER.IA" class="eria-logo">
      </div>
    </div>
  </div>
</body>
</html>'
);

-- Template de email de confirmação de compra
INSERT INTO indiepass.email_templates (id, subject, body_html)
VALUES (
  'purchase-confirmation',
  'Confirmação de compra no IndiePass',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de compra IndiePass</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0; }
    .logo { max-width: 120px; height: auto; margin-bottom: 20px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .ticket { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .ticket-title { font-size: 18px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
    .ticket-info { margin: 10px 0; }
    .qr-code { text-align: center; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .powered-by { margin-top: 10px; }
    .indiepass-logo { width: 30px; height: 30px; vertical-align: middle; margin-right: 5px; }
    .eria-logo { width: 30px; height: 30px; vertical-align: middle; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://seu-dominio.com/indiepass.jpg" alt="IndiePass" class="logo">
      <h1 style="color: white; margin: 0;">Compra realizada com sucesso!</h1>
    </div>
    <div class="content">
      <p>Olá {{ .User.DisplayName }},</p>
      <p>Parabéns! Sua compra no IndiePass foi confirmada.</p>
      
      <div class="ticket">
        <div class="ticket-title">{{ .EventTitle }}</div>
        <div class="ticket-info">
          <p><strong>Data:</strong> {{ .EventDate }}</p>
          <p><strong>Horário:</strong> {{ .EventTime }}</p>
          <p><strong>Local:</strong> {{ .EventLocation }}</p>
          <p><strong>Ingressos:</strong> {{ .TicketCount }}</p>
          <p><strong>Total:</strong> {{ .TotalAmount }}</p>
        </div>
      </div>
      
      <p>Seus ingressos estão disponíveis na aba "Meus Ingressos" do IndiePass.</p>
    </div>
    <div class="footer">
      <p>© 2026 IndiePass — Powered by ER.IA</p>
      <div class="powered-by">
        <img src="https://seu-dominio.com/indiepass.jpg" alt="IndiePass" class="indiepass-logo">
        <img src="https://seu-dominio.com/logo-eria.png" alt="ER.IA" class="eria-logo">
      </div>
    </div>
  </div>
</body>
</html>'
);
