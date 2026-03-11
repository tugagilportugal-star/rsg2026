import React, { createContext, useContext, useEffect, useState } from 'react';

type TicketStatusContextType = {
  hasActiveLot: boolean;
  isLoading: boolean;
};

const TicketStatusContext = createContext<TicketStatusContextType>({
  hasActiveLot: false,
  isLoading: true,
});

export const useTicketStatus = () => useContext(TicketStatusContext);

export const TicketStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasActiveLot, setHasActiveLot] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/get-ticket')
      .then(res => (res.ok ? res.json() : null))
      .then(data => setHasActiveLot(!!data?.active))
      .catch(() => setHasActiveLot(false))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <TicketStatusContext.Provider value={{ hasActiveLot, isLoading }}>
      {children}
    </TicketStatusContext.Provider>
  );
};
