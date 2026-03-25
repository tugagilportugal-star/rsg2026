import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { ConfirmationEmail } from '../sections/ConfirmationEmail';

// =======================
// ENV VARS (OBRIGATÓRIAS)
// =======================
const RESEND_API_KEY = process.env.RESEND_API_KEY;
// O domínio 'rsglisbon.com' precisa de estar verificado no Resend.
// Para testes locais sem verificação, o Resend oferece o domínio 'onboarding@resend.dev'.
// Vamos dar prioridade à variável de ambiente, mas usar 'onboarding@resend.dev' como fallback seguro.
const RESEND_FROM = process.env.RESEND_FROM || 'RSG Lisbon <onboarding@resend.dev>';

if (!RESEND_API_KEY) {
  throw new Error('A variável de ambiente RESEND_API_KEY não está definida.');
}

const resend = new Resend(RESEND_API_KEY);

// =======================
// HANDLER DE TESTE
// =======================
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Apenas o método GET é permitido.' });
  }

  const { email: to } = req.query;

  if (!to || typeof to !== 'string') {
    return res.status(400).json({ message: 'Por favor, forneça um e-mail no parâmetro "email". Ex: /api/test-email?email=seu-email@exemplo.com' });
  }

  try {
    console.log(`[TEST-EMAIL] A enviar e-mail de confirmação para: ${to}`);

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: to,
      subject: '✅ [TESTE] O seu bilhete para o RSG Lisbon 2026',
      // Aqui usamos o componente React diretamente!
      react: ConfirmationEmail({
        name: 'Participante Teste',
        ticketId: `TICKET-${Date.now()}`,
      }),
    });

    if (error) {
      console.error('[TEST-EMAIL] Erro ao enviar e-mail:', error);
      return res.status(400).json({ message: 'Erro ao enviar e-mail.', error });
    }

    return res.status(200).json({ message: `E-mail de teste enviado com sucesso para ${to}!`, emailId: data?.id });
  } catch (error: any) {
    console.error('[TEST-EMAIL] Erro fatal:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.', error: error.message });
  }
}