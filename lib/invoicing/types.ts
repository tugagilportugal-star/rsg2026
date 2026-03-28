// ==================================================================
// Tipos comuns para providers de faturação
// ==================================================================

export type BillingProvider = 'invoicexpress' | 'billpt';

// ==================================================================
// Input genérico para criação de fatura (novo core)
// ==================================================================
export type CreateInvoiceInput = {
  customerName: string;
  customerEmail: string;
  countryIso?: string;
  customerNif?: string | null;
  ticketName: string;
  includeRecording?: boolean;
  amountEuro: number;
  quantity?: number;
  isTest: boolean;
  autoFinalize: boolean;
};

// ==================================================================
// Resultado genérico da criação de fatura (novo core)
// ==================================================================
export type CreateInvoiceResult = {
  provider: BillingProvider;
  invoiceId: string | null;
  invoiceNumber?: string | null;
  status: string | null;
  permalink?: string | null;
  pdfBytes?: Buffer | null;
  totalEuro?: number | null;
  raw?: any;
};

// ==================================================================
// Tipos LEGADOS (compatibilidade com o webhook atual)
// ==================================================================

export type IssueInvoiceInput = {
  customerName: string;
  customerEmail: string;
  countryIso?: string;
  customerNif?: string | null;
  ticketName: string;
  includeRecording?: boolean;
  amountEuro: number;
  quantity?: number;
  isTest: boolean;

  // opcional para não quebrar chamadas antigas
  autoFinalize?: boolean;
};

export type IssueInvoiceResult = {
  provider: BillingProvider;
  invoiceId: string | null;
  invoiceNumber: string | null;
  status: string | null;
  permalink: string | null;
  pdfBytes: Buffer | null;

  // ⚠️ o webhook espera isto
  total: string;

  // mantemos também o valor numérico
  totalEuro: number | null;

  raw?: any;
};

// ==================================================================
// Tipos auxiliares para email (usado pelo webhook)
// ==================================================================
export type InvoiceEmailData = {
  name: string;
  ticketName: string;
  invoiceId: string;
  total: string;
  isTest: boolean;
};
