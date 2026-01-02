
// Este ficheiro deve estar na pasta /api/ do seu projeto (Vercel/Netlify/Next.js)
// Ele corre em ambiente Node.js, não no browser.

export default async function handler(req: any, res: any) {
  console.log("[API] Pedido recebido no endpoint de e-mail");

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Apenas POST é permitido' });
  }

  const { to, subject, html, apiKey, from } = req.body;

  if (!apiKey) {
    return res.status(400).json({ message: 'API Key do Resend não fornecida' });
  }

  try {
    console.log(`[API] A chamar Resend para: ${to}`);
    
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: from || 'onboarding@resend.dev',
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("[API] Erro retornado pelo Resend:", data);
      return res.status(resendResponse.status).json(data);
    }

    console.log("[API] Resposta positiva do Resend:", data);
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("[API] Erro catastrófico na função:", error.message);
    return res.status(500).json({ message: error.message });
  }
}
