import { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { notifyAdmins, getAdminEmails, type StepResult } from '../lib/notify.js';

const resend = new Resend(process.env.RESEND_API_KEY as string);

// Participantes mock reutilizáveis
const P1 = { name: 'João Silva', email: 'joao.silva@teste.pt' };
const P2 = { name: 'Maria Santos', email: 'maria.santos@teste.pt' };
const P3 = { name: 'Pedro Costa', email: 'pedro.costa@teste.pt' };

const BASE_CTX = {
  sessionId: 'cs_test_MOCK_SESSION_001',
  buyerName: 'João Silva [TESTE]',
  buyerEmail: 'joao.silva@teste.pt',
  totalCents: 29900,
  currency: 'eur',
};

type Scenario = {
  description: string;
  ctx: typeof BASE_CTX & { qty: number; participants: typeof P1[]; isError: boolean };
  steps: StepResult[];
};

const SCENARIOS: Record<string, Scenario> = {

  // ── Cenário 1: tudo ok, 1 bilhete ─────────────────────────────────
  'ok-1': {
    description: 'Venda bem-sucedida — 1 bilhete',
    ctx: { ...BASE_CTX, qty: 1, participants: [P1], isError: false },
    steps: [
      { step: 'Gravar Order (DB)', ok: true, detail: 'order_id: ord_abc123' },
      { step: `Gravar Ticket (${P1.name})`, ok: true, detail: 'ticket_id: tkt_xyz456' },
      { step: 'Atualizar contador de bilhetes', ok: true },
      { step: 'Emitir fatura', ok: true, detail: 'FT 2026/042' },
      { step: 'Email da fatura (PDF)', ok: true, detail: `→ ${P1.email}` },
      { step: `Email bilhete (${P1.name})`, ok: true, detail: `→ ${P1.email}` },
    ],
  },

  // ── Cenário 2: tudo ok, 3 bilhetes com cupão ──────────────────────
  'ok-3-coupon': {
    description: 'Venda bem-sucedida — 3 bilhetes com cupão',
    ctx: { ...BASE_CTX, qty: 3, totalCents: 29900 * 3, participants: [P1, P2, P3], isError: false },
    steps: [
      { step: 'Gravar Order (DB)', ok: true, detail: 'order_id: ord_def456' },
      { step: `Gravar Ticket (${P1.name})`, ok: true, detail: 'ticket_id: tkt_001' },
      { step: `Gravar Ticket (${P2.name})`, ok: true, detail: 'ticket_id: tkt_002' },
      { step: `Gravar Ticket (${P3.name})`, ok: true, detail: 'ticket_id: tkt_003' },
      { step: 'Atualizar contador de bilhetes', ok: true },
      { step: 'Desativar cupão (EARLYBIRD)', ok: true },
      { step: 'Emitir fatura', ok: true, detail: 'FT 2026/043' },
      { step: 'Email da fatura (PDF)', ok: true, detail: `→ ${P1.email}` },
      { step: `Email bilhete (${P1.name})`, ok: true, detail: `→ ${P1.email}` },
      { step: `Email bilhete (${P2.name})`, ok: true, detail: `→ ${P2.email}` },
      { step: `Email bilhete (${P3.name})`, ok: true, detail: `→ ${P3.email}` },
    ],
  },

  // ── Cenário 3: falha ao gravar Order no DB ────────────────────────
  'err-db-order': {
    description: 'Erro crítico — falha ao gravar Order no DB',
    ctx: { ...BASE_CTX, qty: 1, participants: [P1], isError: true },
    steps: [
      { step: 'Gravar Order (DB)', ok: false, detail: 'duplicate key value violates unique constraint "orders_stripe_session_id_key"' },
      { step: 'Erro crítico', ok: false, detail: 'DB Order Error: duplicate key value...' },
    ],
  },

  // ── Cenário 4: Order ok, falha no Ticket ─────────────────────────
  'err-db-ticket': {
    description: 'Erro crítico — Order gravado, falha no Ticket',
    ctx: { ...BASE_CTX, qty: 2, totalCents: 29900 * 2, participants: [P1, P2], isError: true },
    steps: [
      { step: 'Gravar Order (DB)', ok: true, detail: 'order_id: ord_abc123' },
      { step: `Gravar Ticket (${P1.name})`, ok: true, detail: 'ticket_id: tkt_001' },
      { step: `Gravar Ticket (${P2.name})`, ok: false, detail: 'null value in column "ticket_type_id" violates not-null constraint' },
      { step: 'Erro crítico', ok: false, detail: 'DB Ticket Error: null value in column "ticket_type_id"' },
    ],
  },

  // ── Cenário 5: falha na emissão da fatura ─────────────────────────
  'err-invoice': {
    description: 'Venda processada com erro na fatura',
    ctx: { ...BASE_CTX, qty: 1, participants: [P1], isError: false },
    steps: [
      { step: 'Gravar Order (DB)', ok: true, detail: 'order_id: ord_abc123' },
      { step: `Gravar Ticket (${P1.name})`, ok: true, detail: 'ticket_id: tkt_xyz456' },
      { step: 'Atualizar contador de bilhetes', ok: true },
      { step: 'Emitir fatura', ok: false, detail: 'bill.pt API 422: campo "nif" inválido para país PT' },
      { step: `Email bilhete (${P1.name})`, ok: true, detail: `→ ${P1.email}` },
    ],
  },

  // ── Cenário 6: falha no envio dos emails ─────────────────────────
  'err-emails': {
    description: 'Venda processada mas emails falharam',
    ctx: { ...BASE_CTX, qty: 2, totalCents: 29900 * 2, participants: [P1, P2], isError: false },
    steps: [
      { step: 'Gravar Order (DB)', ok: true, detail: 'order_id: ord_abc123' },
      { step: `Gravar Ticket (${P1.name})`, ok: true, detail: 'ticket_id: tkt_001' },
      { step: `Gravar Ticket (${P2.name})`, ok: true, detail: 'ticket_id: tkt_002' },
      { step: 'Atualizar contador de bilhetes', ok: true },
      { step: 'Emitir fatura', ok: true, detail: 'FT 2026/044' },
      { step: 'Email da fatura (PDF)', ok: false, detail: 'Resend: You can only send to your own email address in test mode' },
      { step: `Email bilhete (${P1.name})`, ok: false, detail: 'Resend: You can only send to your own email address in test mode' },
      { step: `Email bilhete (${P2.name})`, ok: false, detail: 'Resend: You can only send to your own email address in test mode' },
    ],
  },

  // ── Cenário 7: falha no contador + cupão ─────────────────────────
  'err-counter-coupon': {
    description: 'Venda ok mas contador e cupão falharam',
    ctx: { ...BASE_CTX, qty: 1, participants: [P1], isError: false },
    steps: [
      { step: 'Gravar Order (DB)', ok: true, detail: 'order_id: ord_abc123' },
      { step: `Gravar Ticket (${P1.name})`, ok: true, detail: 'ticket_id: tkt_xyz456' },
      { step: 'Atualizar contador de bilhetes', ok: false, detail: 'RPC consume_ticket_type: function not found' },
      { step: 'Desativar cupão (VIP2026)', ok: false, detail: 'row not found matching id=coupon_999' },
      { step: 'Emitir fatura', ok: true, detail: 'FT 2026/045' },
      { step: 'Email da fatura (PDF)', ok: true, detail: `→ ${P1.email}` },
      { step: `Email bilhete (${P1.name})`, ok: true, detail: `→ ${P1.email}` },
    ],
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Bloquear em produção real (Stripe live key)
  if ((process.env.STRIPE_SECRET_KEY || '').startsWith('sk_live_')) {
    return res.status(403).json({ error: 'Not available in production mode' });
  }

  const scenario = (req.query.scenario as string) || '';

  // Listar cenários disponíveis se não especificado
  if (!scenario) {
    return res.json({
      usage: '/api/test-notify?scenario=<name>',
      scenarios: Object.entries(SCENARIOS).map(([key, s]) => ({
        key,
        description: s.description,
      })),
      adminEmails: getAdminEmails(),
    });
  }

  const s = SCENARIOS[scenario];
  if (!s) {
    return res.status(400).json({
      error: `Cenário "${scenario}" não encontrado`,
      available: Object.keys(SCENARIOS),
    });
  }

  await notifyAdmins(resend, s.steps, s.ctx);

  return res.json({
    ok: true,
    scenario,
    description: s.description,
    sentTo: getAdminEmails(),
    stepsCount: s.steps.length,
    stepsOk: s.steps.filter(x => x.ok).length,
    stepsFail: s.steps.filter(x => !x.ok).length,
  });
}
