import { db } from '../db/db';
import type { PaymentRecord } from '../db/schema';
import { nowIso } from '../db/utils';
import { addCaseChange } from './history';

export type PaymentInput = {
  caseId: string;
  trademarkNo?: string;
  stage?: PaymentRecord['stage'];
  applicationName?: string;
  due: number;
  received: number;
  notes?: string;
  receiptImages?: PaymentRecord['receiptImages'];
};

export async function createPayment(input: PaymentInput) {
  const caseId = input.caseId.trim();
  if (!caseId) throw new Error('Case is required');

  const c = await db.cases.get(caseId);
  if (!c) throw new Error('Case not found');

  const payment: PaymentRecord = {
    dateTime: nowIso(),
    caseId,
    trademarkNo: input.trademarkNo?.trim() || undefined,
    stage: input.stage,
    applicationName: input.applicationName?.trim() || undefined,
    due: Number(input.due) || 0,
    received: Number(input.received) || 0,
    notes: input.notes?.trim() || undefined,
    receiptImages: input.receiptImages?.length ? input.receiptImages : undefined,
  };

  const id = await db.payments.add(payment);
  await addCaseChange(caseId, 'PAYMENT_CREATE', `Payment recorded (Received ${payment.received})`);
  return db.payments.get(id);
}

export async function updatePayment(id: number, patch: Partial<Omit<PaymentRecord, 'id' | 'caseId'>>) {
  const existing = await db.payments.get(id);
  if (!existing) throw new Error('Payment not found');

  const next: PaymentRecord = {
    ...existing,
    ...patch,
  };

  if (patch.trademarkNo != null) next.trademarkNo = patch.trademarkNo.trim() || undefined;
  if (patch.applicationName != null) next.applicationName = patch.applicationName.trim() || undefined;
  if (patch.notes != null) next.notes = patch.notes.trim() || undefined;
  if (patch.due != null) next.due = Number(patch.due) || 0;
  if (patch.received != null) next.received = Number(patch.received) || 0;

  await db.payments.put({ ...next, id });
  await addCaseChange(existing.caseId, 'PAYMENT_UPDATE', 'Payment updated');
  return { ...next, id };
}

export async function deletePayment(id: number) {
  const existing = await db.payments.get(id);
  if (!existing) return;

  await db.payments.delete(id);
  await addCaseChange(existing.caseId, 'PAYMENT_DELETE', 'Payment deleted');
}

export async function getCasePaymentSummary(caseId: string) {
  const payments = await db.payments.where('caseId').equals(caseId).toArray();
  const due = payments.reduce((s, p) => s + (Number(p.due) || 0), 0);
  const received = payments.reduce((s, p) => s + (Number(p.received) || 0), 0);
  const balance = due - received;

  return { due, received, balance, count: payments.length };
}
