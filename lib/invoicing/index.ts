import type {
  CreateInvoiceInput,
  CreateInvoiceResult,
  BillingProvider,
  IssueInvoiceInput,
  IssueInvoiceResult,
} from './types.js';

import { createInvoiceWithInvoiceXpress } from './invoicexpress.js';
import { createInvoiceWithBillpt } from './billpt.js';

function normalizeProvider(p?: string): BillingProvider {
  const v = (p || '').toLowerCase().trim();
  if (v === 'billpt' || v === 'bill.pt') return 'billpt';
  return 'invoicexpress';
}

export async function createInvoice(input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
  const provider = normalizeProvider(process.env.BILLING_PROVIDER);

  if (provider === 'billpt') {
    return createInvoiceWithBillpt(input);
  }

  return createInvoiceWithInvoiceXpress(input);
}

/**
 * Backward-compatible wrapper para o webhook antigo.
 * O webhook chamava issueInvoiceForOrder(...) e esperava um resultado com pdfBytes.
 */
export async function issueInvoiceForOrder(input: IssueInvoiceInput): Promise<IssueInvoiceResult> {
  const res = await createInvoice({
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    countryIso: input.countryIso,
    ticketName: input.ticketName,
    amountEuro: input.amountEuro,
    isTest: input.isTest,
    autoFinalize: input.autoFinalize,
  });

  return {
    provider: res.provider,
    invoiceId: res.invoiceId,
    status: res.status,
    permalink: res.permalink ?? null,
    pdfBytes: res.pdfBytes ?? null,
    totalEuro: res.totalEuro ?? null,
    raw: res.raw,
  };
}
