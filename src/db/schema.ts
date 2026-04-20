export type CaseType = 'Trademark' | 'Copyright' | 'NTN' | 'Company';

export type ClientTypePrefix = 'X' | 'A' | 'B';

export type Stage = 1 | 2 | 3 | 4;

export type CaseChangeType =
  | 'CREATE'
  | 'UPDATE'
  | 'STAGE_CHANGE'
  | 'ASSIGN'
  | 'MONTHLY_CONFIRM'
  | 'MONTHLY_REASSIGN'
  | 'PAYMENT_CREATE'
  | 'PAYMENT_UPDATE'
  | 'PAYMENT_DELETE';

export interface CaseRecord {
  id: string; // Primary key: user-entered unique id

  createdAt: string; // ISO
  updatedAt: string; // ISO

  dateTime: string; // ISO (auto)

  clientType: ClientTypePrefix;

  caseNo: string; // user-entered (can be numeric-looking but keep string)
  folderNo: string; // derived: `${clientType}-${caseNo}`

  type: CaseType;

  trademarkNo?: string; // key for trademark-heavy workflows
  classNo?: number; // 1-45

  nameOfApplication: string;

  stage: Stage;
  subStage?: string;

  notes?: string;

  logoFiles?: Array<{ name: string; type: string; size: number; dataUrl: string }>;

  assignedConsultantId?: number;
}

export interface ConsultantRecord {
  id?: number; // auto
  name: string;
  contact?: string;
  city?: string;
  active: boolean;
}

export interface MonthlyCheckRecord {
  id?: number;
  caseId: string;
  consultantId: number;
  month: string; // YYYY-MM
  stage: Stage;
  status: 'pending' | 'confirmed' | 'reassigned';
  notes?: string;
  timestamp: string; // ISO
}

export interface PaymentRecord {
  id?: number;
  dateTime: string; // ISO

  caseId: string;

  trademarkNo?: string;
  stage?: Stage;
  applicationName?: string;

  due: number;
  received: number;

  notes?: string;

  receiptImages?: Array<{ name: string; type: string; size: number; dataUrl: string }>;
}

export interface CaseChangeRecord {
  id?: number;
  caseId: string;
  at: string; // ISO
  type: CaseChangeType;
  message: string;
}

export interface SettingsRecord {
  id: 'singleton';
  rates: {
    routineX: number;
    urgentY: number;
    premiumZ: number;
  };
  pageSize: number; // default 100
}
