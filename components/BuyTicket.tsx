import React, { useState } from 'react';
import { Button } from './UIComponents';

// ⚠️ SUBSTITUA PELO ID REAL DO SEU SUPABASE
const TICKET_TYPE_ID = 'COLE_O_ID_AQUI'; 

export const BuyTicketButton: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketTypeId: TICKET_TYPE_ID,
          quantity: 1
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Erro ao iniciar: ' + (data.message || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center mt-8">
      <Button onClick={handleBuy} isLoading={loading} className="w-full md:w-auto text-xl py-4 px-12 bg-green-600 hover:bg-green-700">
        Comprar Bilhete (Early Bird) - 150€
      </Button>
      <p className="text-sm text-gray-500 mt-2">Pagamento seguro via Stripe</p>
    </div>
  );
};
