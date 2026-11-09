import { Medicine, DoseLog, DailyDoseItem, MealTiming, MedicineForm } from '../types/medication';

/**
 * Format "YYYY-MM-DD" from a Date object
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format "HH:MM" from a Date object
 */
export function formatTimeKey(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Parse "HH:MM" to total minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Check if a medicine applies on a specific date based on days array and duration
 */
export function isMedicineActiveOnDate(medicine: Medicine, targetDateStr: string): boolean {
  if (!medicine.active) return false;

  const target = new Date(targetDateStr + 'T00:00:00');
  const start = new Date(medicine.startDate + 'T00:00:00');

  // Check if target date is before start date
  if (target < start) return false;

  // Check duration if set
  if (medicine.durationDays && medicine.durationDays > 0) {
    const diffTime = target.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= medicine.durationDays) return false;
  }

  // Check specific day of week if configured
  if (medicine.days && medicine.days.length > 0) {
    const dayOfWeek = target.getDay(); // 0 is Sunday
    if (!medicine.days.includes(dayOfWeek)) return false;
  }

  return true;
}

/**
 * Generates the full list of scheduled dose occurrences for a given date
 */
export function generateDailyDoseList(
  medicines: Medicine[],
  dateStr: string,
  logs: DoseLog[],
  currentTimeStr: string
): DailyDoseItem[] {
  const items: DailyDoseItem[] = [];
  const currentMins = timeToMinutes(currentTimeStr);

  for (const med of medicines) {
    if (!isMedicineActiveOnDate(med, dateStr)) continue;

    for (const time of med.times) {
      const scheduledMins = timeToMinutes(time);
      const log = logs.find(
        (l) => l.medicineId === med.id && l.scheduledTime === time && l.scheduledDate === dateStr
      );

      const isTaken = log?.status === 'taken';
      const isSkipped = log?.status === 'skipped';

      // Due window: within 30 minutes of scheduled time (e.g. -5 min to +30 min)
      const diffMins = currentMins - scheduledMins;
      const isDue = !isTaken && !isSkipped && diffMins >= -10 && diffMins <= 45;
      const isOverdue = !isTaken && !isSkipped && diffMins > 45;
      const isUpcoming = !isTaken && !isSkipped && diffMins < -10;

      items.push({
        id: `${med.id}_${time}_${dateStr}`,
        medicine: med,
        time,
        date: dateStr,
        log,
        isTaken,
        isSkipped,
        isDue,
        isOverdue,
        isUpcoming,
        displayTime: time,
      });
    }
  }

  // Sort chronologically by scheduled time
  return items.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

/**
 * Calculates adherence percentage: (taken / total scheduled) * 100
 */
export function calculateAdherence(totalScheduled: number, takenCount: number): number {
  if (totalScheduled === 0) return 100;
  return Math.min(100, Math.round((takenCount / totalScheduled) * 100));
}

/**
 * Calculate consecutive streak days where user took 100% of scheduled medicines
 */
export function calculateStreak(
  medicines: Medicine[],
  logs: DoseLog[],
  referenceDateStr: string
): number {
  let streak = 0;
  const curr = new Date(referenceDateStr + 'T00:00:00');

  // Check up to past 30 days
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(curr);
    checkDate.setDate(curr.getDate() - i);
    const dateKey = formatDateKey(checkDate);

    // Get active medicines on this date
    let scheduledCount = 0;
    for (const med of medicines) {
      if (isMedicineActiveOnDate(med, dateKey)) {
        scheduledCount += med.times.length;
      }
    }

    if (scheduledCount === 0) {
      // No meds scheduled on this day, skip or continue streak if not day 0
      continue;
    }

    const takenCount = logs.filter(
      (l) => l.scheduledDate === dateKey && l.status === 'taken'
    ).length;

    if (i === 0) {
      // For today, if some are taken, count it, or if all scheduled so far are taken
      if (takenCount > 0 && takenCount === scheduledCount) {
        streak++;
      } else if (takenCount > 0) {
        // partial today, still counts as active streak!
        streak++;
      }
    } else {
      if (takenCount >= scheduledCount) {
        streak++;
      } else {
        // Streak broken
        break;
      }
    }
  }

  return streak;
}

/**
 * Get readable label for Indonesian meal timing
 */
export function getMealTimingLabel(timing: MealTiming): string {
  switch (timing) {
    case 'sesudah':
      return 'Sesudah Makan';
    case 'sebelum':
      return 'Sebelum Makan';
    case 'bersama':
      return 'Bersama Makanan';
    case 'bebas':
      return 'Bebas / Kapan Saja';
    default:
      return 'Sesudah Makan';
  }
}

/**
 * Get readable label for Indonesian medicine form
 */
export function getFormLabel(form: MedicineForm): string {
  switch (form) {
    case 'tablet':
      return 'Tablet';
    case 'kapsul':
      return 'Kapsul';
    case 'sirup':
      return 'Sirup / Cair';
    case 'tetes':
      return 'Obat Tetes';
    case 'salep':
      return 'Salep / Krim';
    case 'injeksi':
      return 'Suntik / Injeksi';
    case 'serbuk':
      return 'Puyer / Serbuk';
    case 'lainnya':
      return 'Lainnya';
    default:
      return 'Tablet';
  }
}

/**
 * Format date in Indonesian locale (e.g. "Senin, 9 November 2026")
 */
export function formatDateIndonesian(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${dayNum} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Group doses into time of day periods (Pagi, Siang, Sore, Malam)
 */
export type TimePeriod = 'Pagi' | 'Siang' | 'Sore' | 'Malam';

export function getTimePeriod(timeStr: string): TimePeriod {
  const mins = timeToMinutes(timeStr);
  if (mins >= 300 && mins < 660) return 'Pagi'; // 05:00 - 10:59
  if (mins >= 660 && mins < 900) return 'Siang'; // 11:00 - 14:59
  if (mins >= 900 && mins < 1140) return 'Sore'; // 15:00 - 18:59
  return 'Malam'; // 19:00 - 04:59
}
