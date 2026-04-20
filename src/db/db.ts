import Dexie, { type Table } from 'dexie';
import type {
  CaseChangeRecord,
  CaseRecord,
  ConsultantRecord,
  MonthlyCheckRecord,
  PaymentRecord,
  SettingsRecord,
} from './schema';

export class AppDB extends Dexie {
  cases!: Table<CaseRecord, string>;
  consultants!: Table<ConsultantRecord, number>;
  monthlyChecks!: Table<MonthlyCheckRecord, number>;
  payments!: Table<PaymentRecord, number>;
  caseChanges!: Table<CaseChangeRecord, number>;
  settings!: Table<SettingsRecord, 'singleton'>;

  constructor() {
    super('case_payment_manager');

    this.version(1).stores({
      cases: 'id, caseNo, folderNo, trademarkNo, type, stage, assignedConsultantId, updatedAt',
      consultants: '++id, name, active',
      monthlyChecks: '++id, caseId, consultantId, month, status, timestamp',
      payments: '++id, caseId, dateTime',
      caseChanges: '++id, caseId, at, type',
      settings: 'id',
    });
  }
}

export const db = new AppDB();

export async function ensureDefaultSettings() {
  const existing = await db.settings.get('singleton');
  if (existing) return;

  await db.settings.put({
    id: 'singleton',
    rates: {
      routineX: 0,
      urgentY: 0,
      premiumZ: 0,
    },
    pageSize: 100,
  });
}
