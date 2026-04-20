import { db } from '../db/db';
import type { Stage } from '../db/schema';
import { nowIso, ym } from '../db/utils';
import { addCaseChange } from './history';

export async function ensureMonthlyCheck(caseId: string, consultantId: number, stage: Stage, month: string = ym()) {
  const existing = await db.monthlyChecks
    .where({ caseId, consultantId, month })
    .first();

  if (existing) return existing;

  const id = await db.monthlyChecks.add({
    caseId,
    consultantId,
    month,
    stage,
    status: 'pending',
    notes: '',
    timestamp: nowIso(),
  });

  return db.monthlyChecks.get(id);
}

export async function confirmMonthlyCheck(id: number, notes?: string) {
  const existing = await db.monthlyChecks.get(id);
  if (!existing) throw new Error('Monthly check not found');

  await db.monthlyChecks.update(id, {
    status: 'confirmed',
    notes: notes?.trim() || '',
    timestamp: nowIso(),
  });

  await addCaseChange(existing.caseId, 'MONTHLY_CONFIRM', `Monthly check confirmed for ${existing.month}`);
}

export async function reassignMonthlyCheck(id: number, newConsultantId: number, notes?: string) {
  const existing = await db.monthlyChecks.get(id);
  if (!existing) throw new Error('Monthly check not found');

  await db.monthlyChecks.update(id, {
    status: 'reassigned',
    notes: notes?.trim() || '',
    timestamp: nowIso(),
  });

  await addCaseChange(existing.caseId, 'MONTHLY_REASSIGN', `Monthly check reassigned for ${existing.month} to consultant #${newConsultantId}`);

  // Create a new pending check for the new consultant
  await ensureMonthlyCheck(existing.caseId, newConsultantId, existing.stage, existing.month);
}
