
// Este ficheiro deve estar na pasta /api/ do seu projeto (Vercel/Netlify/Next.js)
// Ele corre em ambiente Node.js, não no browser.

export default async function handler(req: any, res: any) {
  // Apenas permite pedidos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { to, subject, html, apiKey, from } = req.body;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`, // Aqui a Key estaria protegida se usássemos process.env.RESEND_KEY
      },
      body: JSON.stringify({
        from: from || 'onboarding@resend.dev',
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
