import { saveAs } from 'file-saver';
import { db } from '../db/db';

type BackupPayload = {
  exportedAt: string;
  data: {
    cases: unknown[];
    consultants: unknown[];
    monthlyChecks: unknown[];
    payments: unknown[];
    caseChanges: unknown[];
    settings: unknown[];
  };
};

export async function exportBackup() {
  const payload: BackupPayload = {
    exportedAt: new Date().toISOString(),
    data: {
      cases: await db.cases.toArray(),
      consultants: await db.consultants.toArray(),
      monthlyChecks: await db.monthlyChecks.toArray(),
      payments: await db.payments.toArray(),
      caseChanges: await db.caseChanges.toArray(),
      settings: await db.settings.toArray(),
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const ts = payload.exportedAt.replace(/[:.]/g, '-');
  saveAs(blob, `case-payment-backup-${ts}.json`);
}

export async function importBackup(file: File, mode: 'replace' | 'merge' = 'replace') {
  const text = await file.text();
  const payload = JSON.parse(text) as BackupPayload;

  const data = payload?.data;
  if (!data) throw new Error('Invalid backup file');

  await db.transaction(
    'rw',
    [db.cases, db.consultants, db.monthlyChecks, db.payments, db.caseChanges, db.settings],
    async () => {
    if (mode === 'replace') {
      await Promise.all([
        db.cases.clear(),
        db.consultants.clear(),
        db.monthlyChecks.clear(),
        db.payments.clear(),
        db.caseChanges.clear(),
        db.settings.clear(),
      ]);
    }

    if (Array.isArray(data.cases) && data.cases.length) await db.cases.bulkPut(data.cases as any[]);
    if (Array.isArray(data.consultants) && data.consultants.length) await db.consultants.bulkPut(data.consultants as any[]);
    if (Array.isArray(data.monthlyChecks) && data.monthlyChecks.length) await db.monthlyChecks.bulkPut(data.monthlyChecks as any[]);
    if (Array.isArray(data.payments) && data.payments.length) await db.payments.bulkPut(data.payments as any[]);
    if (Array.isArray(data.caseChanges) && data.caseChanges.length) await db.caseChanges.bulkPut(data.caseChanges as any[]);
    if (Array.isArray(data.settings) && data.settings.length) await db.settings.bulkPut(data.settings as any[]);
    }
  );
}
