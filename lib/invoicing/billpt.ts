import type { CreateInvoiceInput, CreateInvoiceResult } from './types';

/**
 * BILL.PT (DEV) – Adapter (placeholder)
 * 
 * Este ficheiro existe para manter o webhook agnóstico do provider.
 * Por enquanto não implementa a integração com dev.bill.pt.
 * Quando estiver pronto, esta função deve:
 * - criar documento
 * - (opcional) obter PDF
 * - devolver invoiceId/status/permalink/pdfBytes
 */
export async function createInvoiceWithBillpt(_input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
  console.warn('⚠️ Bill.pt adapter ainda não implementado. Mantém BILLING_PROVIDER=invoicexpress por enquanto.');

  return {
    provider: 'billpt',
    invoiceId: null,
    status: null,
    permalink: null,
    pdfBytes: null,
  };
}
