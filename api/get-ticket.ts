// api/get-ticket.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const id = String(req.query.id || '').trim();

    // Se vier ID -> devolve aquele lote (comportamento antigo, mantém compatibilidade)
    if (id) {
      const { data, error } = await supabase
        .from('ticket_types')
        .select('id,name,price,currency,active,quantity_total,quantity_sold,sort')
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ message: 'Ticket type não encontrado.' });
      }

      return res.status(200).json(data);
    }

    // Se NÃO vier ID -> devolve o lote ativo com menor sort (lote atual)
    const { data: activeTicket, error: activeErr } = await supabase
      .from('ticket_types')
      .select('id,name,price,currency,active,quantity_total,quantity_sold,sort')
      .eq('active', true)
      .order('sort', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (activeErr) {
      return res.status(500).json({ message: activeErr.message });
    }

    if (!activeTicket) {
      return res.status(404).json({ message: 'Nenhum lote ativo disponível.' });
    }

    return res.status(200).json(activeTicket);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}
