export type BillingProvider = 'invoicexpress' | 'billpt';

export type CreateInvoiceInput = {
  customerName: string;
  customerEmail: string;
  countryIso?: string;
  ticketName: string;
  amountEuro: number;

  // controle do fluxo
  isTest: boolean;
  autoFinalize: boolean;
};

export type CreateInvoiceResult = {
  provider: BillingProvider;
  invoiceId: string | null;
  status: string | null;

  // opcional (depende do provider)
  permalink?: string | null;

  // Para testes end-to-end (PDF para anexar e enviar pelo Resend)
  pdfBytes?: Buffer | null;

  // Para preencher email (se provider devolver total)
  totalEuro?: number | null;

  // debug
  raw?: any;
};
