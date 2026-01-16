export type BillingProvider = 'invoicexpress' | 'billpt';

export type CreateInvoiceInput = {
  customerName: string;
  customerEmail: string;
  countryIso?: string;
  ticketName: string;
  amountEuro: number;

  // controlado pelo webhook
  isTest: boolean;
  autoFinalize: boolean;
};

export type CreateInvoiceResult = {
  provider: BillingProvider;

  invoiceId: string | null;
  status?: string | null;
  permalink?: string | null;

  // Total final do documento (se o provider devolver)
  totalEuro?: number;

  // Para testes end-to-end: PDF do documento (se disponível)
  pdfBytes?: Buffer | null;

  raw?: any;
};
