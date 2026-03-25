import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';

// =======================
// ENV VARS (OBRIGATÓRIAS)
// =======================
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'RSG Lisbon <onboarding@resend.dev>';

if (!RESEND_API_KEY) {
  throw new Error('A variável de ambiente RESEND_API_KEY não está definida.');
}

const resend = new Resend(RESEND_API_KEY);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Apenas o método GET é permitido.' });
  }

  const { email: to } = req.query;

  if (!to || typeof to !== 'string') {
    return res.status(400).json({
      message:
        'Por favor, forneça um e-mail no parâmetro "email". Ex: /api/test-email?email=seu-email@exemplo.com',
    });
  }

  try {
    // 1. Ler o template HTML do ficheiro
    const templatePath = path.resolve(process.cwd(), 'api/email-template.html');
    let htmlBody = fs.readFileSync(templatePath, 'utf-8');

    // 2. Definir os dados de teste
    const name = 'Participante Teste';
    const ticketId = `TICKET-${Date.now()}`;

    // 3. Substituir os marcadores (placeholders) no HTML
    htmlBody = htmlBody.replace(/{{name}}/g, name);
    htmlBody = htmlBody.replace(/{{ticketId}}/g, ticketId);
    // Nota: O QR Code também é dinâmico, usando o ticketId na URL da imagem.

    console.log(`[EMAIL-TEST] A enviar e-mail de teste para: ${to}`);

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: to,
      subject: '✅ [TESTE] O seu bilhete para o RSG Lisbon 2026',
      html: htmlBody, // Usamos a propriedade 'html' em vez de 'react'
    });

    if (error) {
      console.error('[EMAIL-TEST] Erro ao enviar e-mail:', error);
      return res.status(400).json({ message: 'Erro ao enviar e-mail.', error });
    }

    return res.status(200).json({ message: `E-mail de teste enviado com sucesso para ${to}!`, emailId: data?.id });
  } catch (error: any) {
    console.error('[EMAIL-TEST] Erro fatal:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.', error: error.message });
  }
}