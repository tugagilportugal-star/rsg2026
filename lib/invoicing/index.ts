import type {
  BillingProvider,
  CreateInvoiceInput,
  CreateInvoiceResult,
  IssueInvoiceInput,
  IssueInvoiceResult,
} from './types.js';

import { createInvoiceWithInvoiceXpress } from './invoicexpress.js';
import { createInvoiceWithBillpt } from './billpt.js';

// ==================================================================
// Seleção do provider ativo
// ==================================================================
function normalizeProvider(p?: string): BillingProvider {
  const v = (p || '').toLowerCase().trim();
  if (v === 'billpt' || v === 'bill.pt') return 'billpt';
  return 'invoicexpress';
}

// ==================================================================
// API NOVA (core) — usada internamente
// ==================================================================
export async function createInvoice(input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
  const provider = normalizeProvider(process.env.BILLING_PROVIDER);

  if (provider === 'billpt') {
    return createInvoiceWithBillpt(input);
  }

  return createInvoiceWithInvoiceXpress(input);
}

// ==================================================================
// API LEGADA — COMPATÍVEL COM O webhook atual
// ⚠️ NÃO REMOVER (evita quebrar deploy)
// ==================================================================
export async function issueInvoiceForOrder(
  input: IssueInvoiceInput
): Promise<IssueInvoiceResult> {
  const envAutoFinalize =
    (process.env.BILLING_AUTO_FINALIZE || 'false').toLowerCase() === 'true';

  const res = await createInvoice({
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    countryIso: input.countryIso,
    customerNif: input.customerNif,
    ticketName: input.ticketName,
    includeRecording: input.includeRecording,
    amountEuro: input.amountEuro,
    isTest: input.isTest,
    autoFinalize: input.autoFinalize ?? envAutoFinalize,
  });

  const totalStr =
    res.totalEuro != null
      ? res.totalEuro.toFixed(2)
      : input.amountEuro.toFixed(2);

  return {
    provider: res.provider,
    invoiceId: res.invoiceId,
    status: res.status,
    permalink: res.permalink ?? null,
    pdfBytes: res.pdfBytes ?? null,
    total: totalStr,          // 👈 o webhook usa isto
    totalEuro: res.totalEuro ?? null,
    raw: res.raw,
  };
}
