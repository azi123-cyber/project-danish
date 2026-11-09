import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Medicine, DoseLog } from '../types/medication';
import {
  formatDateIndonesian,
  formatDateKey,
  isMedicineActiveOnDate,
} from '../utils/medication';

interface HistoryTabProps {
  medicines: Medicine[];
  logs: DoseLog[];
  onResetLogs: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  medicines,
  logs,
  onResetLogs,
}) => {
  // Generate past 7 days breakdown
  const pastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i)); // Chronological order: oldest to today
    const dateStr = formatDateKey(d);

    let scheduled = 0;
    medicines.forEach((m) => {
      if (isMedicineActiveOnDate(m, dateStr)) {
        scheduled += m.times.length;
      }
    });

    const dayLogs = logs.filter((l) => l.scheduledDate === dateStr);
    const taken = dayLogs.filter((l) => l.status === 'taken').length;
    const skipped = dayLogs.filter((l) => l.status === 'skipped').length;
    const percentage =
      scheduled > 0 ? Math.min(100, Math.round((taken / scheduled) * 100)) : 100;

    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const shortDay = dayNames[d.getDay()];

    return {
      dateStr,
      shortDay,
      scheduled,
      taken,
      skipped,
      percentage,
      isToday: i === 6,
    };
  });

  const totalTakenPastWeek = pastDays.reduce((acc, d) => acc + d.taken, 0);
  const totalScheduledPastWeek = pastDays.reduce((acc, d) => acc + d.scheduled, 0);
  const weeklyAverage =
    totalScheduledPastWeek > 0
      ? Math.round((totalTakenPastWeek / totalScheduledPastWeek) * 100)
      : 100;

  const handleResetPrompt = () => {
    Alert.alert(
      'Reset Riwayat Konsumsi',
      'Apakah Anda yakin ingin mengosongkan semua riwayat minum obat? Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: onResetLogs },
      ]
    );
  };

  // Recent 15 logs, newest first
  const recentLogs = [...logs].reverse().slice(0, 15);

  return (
    <View style={styles.container}>
      {/* Header and Reset Button */}
      <View style={styles.headerCard}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>Laporan & Kepatuhan</Text>
          <Text style={styles.headerSub}>
            Pantau konsistensi dan disiplin konsumsi obat 7 hari terakhir.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={handleResetPrompt}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={13} color="#DC2626" />
          <Text style={styles.resetBtnText}>Reset Riwayat</Text>
        </TouchableOpacity>
      </View>

      {/* KPI 7-Day Average & Stats */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiCardLabel}>RATA-RATA 7 HARI</Text>
          <View style={styles.kpiCardScoreRow}>
            <Text style={[styles.kpiCardScore, { color: '#0D9488' }]}>
              {weeklyAverage}%
            </Text>
          </View>
          <Text style={styles.kpiCardSub}>Kepatuhan terapi</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiCardLabel}>DOSIS DIMINUM</Text>
          <View style={styles.kpiCardScoreRow}>
            <Text style={[styles.kpiCardScore, { color: '#059669' }]}>
              {totalTakenPastWeek}
            </Text>
          </View>
          <Text style={styles.kpiCardSub}>dari {totalScheduledPastWeek} jadwal</Text>
        </View>
      </View>

      {/* 7-Day Adherence Visual Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Grafik Kepatuhan 7 Hari Terakhir</Text>
          <View style={styles.chartLegend}>
            <View style={[styles.legendDot, { backgroundColor: '#0D9488' }]} />
            <Text style={styles.legendText}>Tercapai</Text>
          </View>
        </View>

        {/* Bar chart container */}
        <View style={styles.barsContainer}>
          {pastDays.map((day) => (
            <View key={day.dateStr} style={styles.barCol}>
              <Text style={styles.barValText}>{day.percentage}%</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${Math.max(8, day.percentage)}%`,
                      backgroundColor:
                        day.percentage === 100
                          ? '#10B981'
                          : day.percentage >= 50
                          ? '#0D9488'
                          : '#F59E0B',
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.barDayText,
                  day.isToday && styles.barDayTextToday,
                ]}
              >
                {day.shortDay}
              </Text>
              {day.isToday && <View style={styles.todayIndicatorDot} />}
            </View>
          ))}
        </View>
      </View>

      {/* Audit Log / History Records */}
      <View style={styles.logsSection}>
        <Text style={styles.logsSectionTitle}>Catatan Aktivitas Terakhir</Text>

        {recentLogs.length === 0 ? (
          <View style={styles.emptyLogsCard}>
            <Ionicons name="document-text-outline" size={28} color="#94A3B8" />
            <Text style={styles.emptyLogsText}>
              Belum ada catatan aktivitas obat. Ketika Anda menandai minum atau melewati obat, catatan akan tersimpan di sini.
            </Text>
          </View>
        ) : (
          <View style={styles.logsList}>
            {recentLogs.map((log) => {
              const med = medicines.find((m) => m.id === log.medicineId);
              const isTaken = log.status === 'taken';

              const logTimeDisplay = log.takenAt
                ? new Date(log.takenAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : null;

              return (
                <View key={log.id} style={styles.logItem}>
                  <View
                    style={[
                      styles.logIconCircle,
                      isTaken ? styles.logIconTaken : styles.logIconSkipped,
                    ]}
                  >
                    <Ionicons
                      name={isTaken ? 'checkmark' : 'close'}
                      size={14}
                      color={isTaken ? '#059669' : '#DC2626'}
                    />
                  </View>

                  <View style={styles.logTextGroup}>
                    <Text style={styles.logMedName}>
                      {med ? med.name : 'Obat'}
                    </Text>
                    <Text style={styles.logDetail}>
                      Jadwal: {log.scheduledTime} WIB · {log.scheduledDate}
                    </Text>
                  </View>

                  <View style={styles.logRight}>
                    <View
                      style={[
                        styles.logStatusBadge,
                        isTaken
                          ? styles.logStatusBadgeTaken
                          : styles.logStatusBadgeSkipped,
                      ]}
                    >
                      <Text
                        style={[
                          styles.logStatusBadgeText,
                          isTaken
                            ? styles.logStatusBadgeTextTaken
                            : styles.logStatusBadgeTextSkipped,
                        ]}
                      >
                        {isTaken ? 'Diminum' : 'Dilewati'}
                      </Text>
                    </View>
                    {logTimeDisplay && (
                      <Text style={styles.logTimestamp}>{logTimeDisplay} WIB</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  kpiCardScoreRow: {
    marginTop: 4,
  },
  kpiCardScore: {
    fontSize: 24,
    fontWeight: '900',
  },
  kpiCardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingTop: 16,
    paddingBottom: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 4,
  },
  barValText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  barTrack: {
    width: 14,
    height: 70,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barDayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  barDayTextToday: {
    color: '#0D9488',
    fontWeight: '900',
  },
  todayIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0D9488',
    marginTop: 1,
  },
  logsSection: {
    gap: 8,
  },
  logsSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: 2,
  },
  emptyLogsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  emptyLogsText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 280,
  },
  logsList: {
    gap: 8,
  },
  logItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logIconTaken: {
    backgroundColor: '#ECFDF5',
  },
  logIconSkipped: {
    backgroundColor: '#FEF2F2',
  },
  logTextGroup: {
    flex: 1,
  },
  logMedName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  logDetail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  logRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  logStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  logStatusBadgeTaken: {
    backgroundColor: '#ECFDF5',
  },
  logStatusBadgeSkipped: {
    backgroundColor: '#FEF2F2',
  },
  logStatusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  logStatusBadgeTextTaken: {
    color: '#059669',
  },
  logStatusBadgeTextSkipped: {
    color: '#DC2626',
  },
  logTimestamp: {
    fontSize: 9,
    color: '#94A3B8',
  },
});
