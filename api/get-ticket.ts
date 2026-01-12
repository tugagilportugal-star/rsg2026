import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Inicializa com as chaves de SERVIDOR (que já existem na Vercel)
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Ticket ID required' });
  }

  try {
    const { data, error } = await supabase
      .from('ticket_types')
      .select('name, price, currency, active')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Database error' });
    }

    if (!data) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Retorna apenas os dados públicos necessários
    return res.status(200).json(data);

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}