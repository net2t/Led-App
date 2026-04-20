import { db } from '../db/db';
import type { CaseRecord, CaseType, ClientTypePrefix, Stage } from '../db/schema';
import { clampStage, isValidClassNo, makeFolderNo, nowIso } from '../db/utils';
import { addCaseChange } from './history';

export type CaseInput = {
  id: string;
  clientType: ClientTypePrefix;
  caseNo: string;
  type: CaseType;
  trademarkNo?: string;
  classNo?: number;
  nameOfApplication: string;
  stage: Stage;
  subStage?: string;
  notes?: string;
  logoFiles?: Array<{ name: string; type: string; size: number; dataUrl: string }>;
  assignedConsultantId?: number;
};

export async function createCase(input: CaseInput) {
  const id = input.id.trim();
  if (!id) throw new Error('Case ID is required');

  const caseNo = input.caseNo.trim();
  if (!caseNo) throw new Error('Case No is required');
  if (!/^\d{3}-\d{3}$/.test(caseNo)) {
    throw new Error('Case No format must be like 700-001');
  }

  const existing = await db.cases.get(id);
  if (existing) throw new Error('Case ID already exists');

  if (input.classNo != null && !isValidClassNo(input.classNo)) {
    throw new Error('Class must be a whole number between 1 and 45');
  }

  const iso = nowIso();
  const folderNo = makeFolderNo(input.clientType, caseNo);

  const record: CaseRecord = {
    id,
    createdAt: iso,
    updatedAt: iso,
    dateTime: iso,
    clientType: input.clientType,
    caseNo,
    folderNo,
    type: input.type,
    trademarkNo: input.trademarkNo?.trim() || undefined,
    classNo: input.classNo,
    nameOfApplication: input.nameOfApplication.trim(),
    stage: clampStage(input.stage),
    subStage: input.subStage?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    logoFiles: input.logoFiles?.length ? input.logoFiles : undefined,
    assignedConsultantId: input.assignedConsultantId,
  };

  await db.cases.add(record);
  await addCaseChange(id, 'CREATE', `Case created (Stage ${record.stage})`);

  if (record.assignedConsultantId != null) {
    await addCaseChange(id, 'ASSIGN', `Assigned consultant #${record.assignedConsultantId}`);
  }

  return record;
}

export async function updateCase(id: string, patch: Partial<Omit<CaseRecord, 'id' | 'createdAt'>>) {
  const existing = await db.cases.get(id);
  if (!existing) throw new Error('Case not found');

  const updatedAt = nowIso();

  let next: CaseRecord = {
    ...existing,
    ...patch,
    updatedAt,
  };

  if (patch.caseNo != null || patch.clientType != null) {
    next = {
      ...next,
      folderNo: makeFolderNo(next.clientType, next.caseNo),
    };
  }

  if (patch.classNo != null && !isValidClassNo(patch.classNo)) {
    throw new Error('Class must be a whole number between 1 and 45');
  }

  if (patch.stage != null) {
    next.stage = clampStage(patch.stage);
  }

  await db.cases.put(next);
  await addCaseChange(id, 'UPDATE', 'Case updated');

  return next;
}

export async function setCaseStage(id: string, stage: Stage, subStage?: string) {
  const existing = await db.cases.get(id);
  if (!existing) throw new Error('Case not found');

  const nextStage = clampStage(stage);
  const next: CaseRecord = {
    ...existing,
    stage: nextStage,
    subStage: subStage?.trim() || undefined,
    updatedAt: nowIso(),
  };

  await db.cases.put(next);
  await addCaseChange(id, 'STAGE_CHANGE', `Stage changed to ${nextStage}`);

  return next;
}

export async function assignConsultant(id: string, consultantId?: number) {
  const existing = await db.cases.get(id);
  if (!existing) throw new Error('Case not found');

  const next: CaseRecord = {
    ...existing,
    assignedConsultantId: consultantId,
    updatedAt: nowIso(),
  };

  await db.cases.put(next);
  await addCaseChange(id, 'ASSIGN', consultantId != null ? `Assigned consultant #${consultantId}` : 'Unassigned consultant');

  return next;
}
