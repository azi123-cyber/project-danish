export type MedicineForm = 
  | 'tablet'
  | 'kapsul'
  | 'sirup'
  | 'tetes'
  | 'salep'
  | 'injeksi'
  | 'serbuk'
  | 'lainnya';

export type MealTiming = 
  | 'sesudah'
  | 'sebelum'
  | 'bersama'
  | 'bebas';

export interface Medicine {
  id: string;
  name: string;
  dose: string; // e.g. "1 Tablet", "10 ml", "2 Tetes"
  form: MedicineForm;
  mealTiming: MealTiming;
  times: string[]; // ["07:00", "13:00", "19:00"]
  days: number[]; // 0-6 (0 = Minggu, 1 = Senin, ...). Empty array means every day
  color: string; // e.g. "#0284c7"
  stock: number;
  stockAlertThreshold: number;
  notes?: string;
  startDate: string; // "YYYY-MM-DD"
  durationDays?: number; // optional, null/undefined means ongoing
  active: boolean;
  createdAt: string;
}

export interface DoseLog {
  id: string;
  medicineId: string;
  scheduledTime: string; // "HH:MM"
  scheduledDate: string; // "YYYY-MM-DD"
  status: 'taken' | 'skipped' | 'snoozed';
  takenAt?: string; // ISO timestamp
  skippedReason?: string;
  snoozedUntil?: string; // "HH:MM"
}

export interface DailyDoseItem {
  id: string; // unique key for the dose occurrence: `${medicine.id}_${time}_${date}`
  medicine: Medicine;
  time: string; // "HH:MM"
  date: string; // "YYYY-MM-DD"
  log?: DoseLog;
  isTaken: boolean;
  isSkipped: boolean;
  isDue: boolean; // within current window
  isOverdue: boolean; // past window and not taken
  isUpcoming: boolean; // later today
  displayTime: string;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  dailySummaryTime: string; // e.g. "07:30"
  leadTimeMinutes: number; // remind X minutes before (0 = right on time)
}
