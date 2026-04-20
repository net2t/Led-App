import { db } from '../db/db';
import type { CaseChangeType } from '../db/schema';
import { nowIso } from '../db/utils';

export async function addCaseChange(caseId: string, type: CaseChangeType, message: string) {
  await db.caseChanges.add({
    caseId,
    type,
    message,
    at: nowIso(),
  });
}
