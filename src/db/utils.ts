import type { ClientTypePrefix, Stage } from './schema';

export function nowIso() {
  return new Date().toISOString();
}

export function ym(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function makeFolderNo(prefix: ClientTypePrefix, caseNo: string) {
  const trimmed = caseNo.trim();
  return `${prefix}-${trimmed}`;
}

export function clampStage(s: number): Stage {
  if (s <= 1) return 1;
  if (s >= 4) return 4;
  return s as Stage;
}

export function isValidClassNo(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 45;
}
