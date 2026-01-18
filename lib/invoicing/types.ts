export type BillingProvider = 'invoicexpress' | 'billpt';

export type CreateInvoiceInput = {
  customerName: string;
  customerEmail: string;
  countryIso?: string;
  ticketName: string;
  amountEuro: number;
  isTest: boolean;
  autoFinalize: boolean;
};

export type CreateInvoiceResult = {
  provider: BillingProvider;
  invoiceId: string | null;
  status: string | null;
  permalink?: string | null;
  pdfBytes?: Buffer | null;
  totalEuro?: number | null;
  raw?: any;
};

// ================================
// Tipos compatíveis com o webhook antigo
// ================================
export type InvoiceEmailData = {
  name: string;
  ticketName: string;
  invoiceId: string;
  total: string; // já formatado, ex: "43.05"
  isTest: boolean;
};

export type IssueInvoiceInput = {
  customerName: string;
  customerEmail: string;
  countryIso?: string;
  ticketName: string;
  amountEuro: number;
  isTest: boolean;
  autoFinalize: boolean;
};

export type IssueInvoiceResult = {
  provider: BillingProvider;
  invoiceId: string | null;
  status: string | null;
  permalink: string | null;
  pdfBytes: Buffer | null;
  totalEuro: number | null;
  raw?: any;
};
