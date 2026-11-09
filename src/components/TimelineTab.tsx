import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailyDoseItem } from '../types/medication';
import { DoseCard } from './DoseCard';
import { formatDateIndonesian, getTimePeriod, TimePeriod } from '../utils/medication';

interface TimelineTabProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  doses: DailyDoseItem[];
  onMarkAsTaken: (item: DailyDoseItem) => void;
  onUndoTaken: (item: DailyDoseItem) => void;
  onSnooze: (item: DailyDoseItem, minutes: number) => void;
  onSkip: (item: DailyDoseItem) => void;
  onOpenAddModal: () => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  selectedDate,
  setSelectedDate,
  doses,
  onMarkAsTaken,
  onUndoTaken,
  onSnooze,
  onSkip,
  onOpenAddModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'taken'>('all');

  const todayKey = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayKey;

  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(todayKey);
  };

  const filteredDoses = doses.filter((item) => {
    if (filter === 'pending') return !item.isTaken && !item.isSkipped;
    if (filter === 'taken') return item.isTaken;
    return true;
  });

  const takenCount = doses.filter((d) => d.isTaken).length;
  const pendingCount = doses.filter((d) => !d.isTaken && !d.isSkipped).length;

  const periods: { name: TimePeriod; title: string; icon: keyof typeof Ionicons.glyphMap; color: string; range: string }[] = [
    { name: 'Pagi', title: 'Pagi Hari', icon: 'sunny-outline', color: '#D97706', range: '05:00 - 10:59' },
    { name: 'Siang', title: 'Siang Hari', icon: 'partly-sunny-outline', color: '#EA580C', range: '11:00 - 14:59' },
    { name: 'Sore', title: 'Sore Hari', icon: 'partly-sunny', color: '#E11D48', range: '15:00 - 18:59' },
    { name: 'Malam', title: 'Malam Hari', icon: 'moon-outline', color: '#4F46E5', range: '19:00 - 04:59' },
  ];

  return (
    <View style={styles.container}>
      {/* Date Navigator Bar */}
      <View style={styles.dateBar}>
        <TouchableOpacity
          style={styles.navArrowBtn}
          onPress={handlePrevDay}
          activeOpacity={0.7}
          accessibilityLabel="Hari sebelumnya"
        >
          <Ionicons name="chevron-back" size={18} color="#475569" />
        </TouchableOpacity>

        <View style={styles.dateCenterContainer}>
          <Text style={styles.dateLabel} numberOfLines={1}>
            {formatDateIndonesian(selectedDate)}
          </Text>
          {isToday ? (
            <View style={styles.todayChipActive}>
              <Text style={styles.todayChipActiveText}>Hari Ini</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.returnTodayBtn}
              onPress={handleToday}
              activeOpacity={0.7}
            >
              <Text style={styles.returnTodayBtnText}>Kembali ke Hari Ini</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.navArrowBtn}
          onPress={handleNextDay}
          activeOpacity={0.7}
          accessibilityLabel="Hari berikutnya"
        >
          <Ionicons name="chevron-forward" size={18} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Filter Segmented Pills */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
            Semua ({doses.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'pending' && styles.filterChipActive]}
          onPress={() => setFilter('pending')}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.filterChipText, filter === 'pending' && styles.filterChipTextActive]}
          >
            Belum ({pendingCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'taken' && styles.filterChipActive]}
          onPress={() => setFilter('taken')}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.filterChipText, filter === 'taken' && styles.filterChipTextActive]}
          >
            Sudah ({takenCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Doses Grouped By Period */}
      {filteredDoses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="checkmark-done" size={32} color="#0D9488" />
          </View>
          <Text style={styles.emptyTitle}>
            {filter === 'pending'
              ? 'Semua Obat Sudah Diminum'
              : filter === 'taken'
              ? 'Belum Ada Obat Diminum'
              : 'Tidak Ada Jadwal Obat'}
          </Text>
          <Text style={styles.emptySub}>
            {filter === 'pending'
              ? 'Luar biasa! Disiplin konsumsi obat harian Anda sangat baik.'
              : 'Jadwal obat pada tanggal ini tidak tersedia atau telah selesai.'}
          </Text>
          {doses.length === 0 && (
            <TouchableOpacity
              style={styles.addMedEmptyBtn}
              onPress={onOpenAddModal}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addMedEmptyText}>Tambah Obat Baru</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.periodsList}>
          {periods.map((period) => {
            const periodItems = filteredDoses.filter(
              (item) => getTimePeriod(item.time) === period.name
            );

            if (periodItems.length === 0) return null;

            return (
              <View key={period.name} style={styles.periodSection}>
                {/* Period Section Header */}
                <View style={styles.periodHeader}>
                  <View style={styles.periodHeaderLeft}>
                    <Ionicons name={period.icon} size={16} color={period.color} />
                    <Text style={styles.periodTitle}>{period.title}</Text>
                    <Text style={styles.periodRange}>({period.range})</Text>
                  </View>
                  <View style={styles.periodCountBadge}>
                    <Text style={styles.periodCountText}>
                      {periodItems.length} dosis
                    </Text>
                  </View>
                </View>

                {/* Period Items */}
                <View style={styles.periodCardsList}>
                  {periodItems.map((item) => (
                    <DoseCard
                      key={item.id}
                      item={item}
                      onMarkAsTaken={onMarkAsTaken}
                      onUndoTaken={onUndoTaken}
                      onSnooze={onSnooze}
                      onSkip={onSkip}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      )}
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
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateCenterContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  todayChipActive: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
  },
  todayChipActiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F766E',
  },
  returnTodayBtn: {
    marginTop: 3,
  },
  returnTodayBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D9488',
    textDecorationLine: 'underline',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  periodsList: {
    gap: 16,
    marginTop: 4,
  },
  periodSection: {
    gap: 8,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  periodHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  periodTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  periodRange: {
    fontSize: 11,
    color: '#94A3B8',
  },
  periodCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  periodCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  periodCardsList: {
    gap: 10,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    gap: 8,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  addMedEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0D9488',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  addMedEmptyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
