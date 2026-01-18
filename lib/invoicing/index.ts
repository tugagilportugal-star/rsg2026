import type { CreateInvoiceInput, CreateInvoiceResult, BillingProvider } from './types.js';
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
