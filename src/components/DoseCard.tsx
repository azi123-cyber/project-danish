import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailyDoseItem } from '../types/medication';
import { getMealTimingLabel, getFormLabel } from '../utils/medication';

interface DoseCardProps {
  item: DailyDoseItem;
  onMarkAsTaken: (item: DailyDoseItem) => void;
  onUndoTaken: (item: DailyDoseItem) => void;
  onSnooze: (item: DailyDoseItem, minutes: number) => void;
  onSkip: (item: DailyDoseItem) => void;
}

export const DoseCard: React.FC<DoseCardProps> = ({
  item,
  onMarkAsTaken,
  onUndoTaken,
  onSnooze,
  onSkip,
}) => {
  const { medicine, time, isTaken, isSkipped, isDue, isOverdue, log } = item;

  // Format taken timestamp if available
  const takenTimeDisplay = log?.takenAt
    ? new Date(log.takenAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <View
      style={[
        styles.card,
        isTaken
          ? styles.cardTaken
          : isDue
          ? styles.cardDue
          : isOverdue
          ? styles.cardOverdue
          : styles.cardNormal,
      ]}
    >
      {/* Due Accent Top Bar */}
      {isDue && <View style={styles.dueTopBar} />}

      <View style={styles.cardContent}>
        {/* Top Info Row */}
        <View style={styles.topInfoRow}>
          {/* Time Badge */}
          <View
            style={[
              styles.timeBadge,
              isTaken
                ? styles.timeBadgeTaken
                : isDue
                ? styles.timeBadgeDue
                : isOverdue
                ? styles.timeBadgeOverdue
                : styles.timeBadgeNormal,
            ]}
          >
            <Text
              style={[
                styles.timeText,
                isDue ? styles.timeTextWhite : isTaken ? styles.timeTextTaken : styles.timeTextDark,
              ]}
            >
              {time}
            </Text>
            <Text
              style={[
                styles.timeStatusLabel,
                isDue ? styles.timeTextWhite : isTaken ? styles.timeTextTaken : styles.timeTextDark,
              ]}
            >
              {isTaken ? 'Diminum' : isDue ? 'Waktunya' : isOverdue ? 'Terlewat' : 'Jadwal'}
            </Text>
          </View>

          {/* Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.titleRow}>
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: medicine.color || '#0D9488' },
                ]}
              />
              <Text
                style={[
                  styles.medName,
                  isTaken && styles.medNameTaken,
                ]}
                numberOfLines={1}
              >
                {medicine.name}
              </Text>
            </View>

            <Text style={styles.medDose}>{medicine.dose}</Text>

            {/* Tags row */}
            <View style={styles.tagsRow}>
              <View style={styles.tag}>
                <Ionicons name="restaurant-outline" size={11} color="#475569" />
                <Text style={styles.tagText}>
                  {getMealTimingLabel(medicine.mealTiming)}
                </Text>
              </View>

              <View style={styles.tag}>
                <Ionicons name="medical-outline" size={11} color="#475569" />
                <Text style={styles.tagText}>
                  {getFormLabel(medicine.form)}
                </Text>
              </View>

              <View
                style={[
                  styles.stockTag,
                  medicine.stock <= medicine.stockAlertThreshold
                    ? styles.stockTagWarning
                    : styles.stockTagNormal,
                ]}
              >
                <Text
                  style={[
                    styles.stockTagText,
                    medicine.stock <= medicine.stockAlertThreshold && styles.stockTagTextWarning,
                  ]}
                >
                  Sisa {medicine.stock}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Doctor Note if any */}
        {medicine.notes ? (
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle-outline" size={13} color="#0D9488" />
            <Text style={styles.noteText} numberOfLines={2}>
              {medicine.notes}
            </Text>
          </View>
        ) : null}

        {/* Action Controls */}
        <View style={styles.actionsDivider} />

        {isTaken ? (
          // Taken status bar + Undo button
          <View style={styles.takenRow}>
            <View style={styles.takenStatusBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={styles.takenStatusText}>
                Sudah diminum {takenTimeDisplay ? `pukul ${takenTimeDisplay} WIB` : 'hari ini'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.undoBtn}
              onPress={() => onUndoTaken(item)}
              activeOpacity={0.7}
              accessibilityLabel="Batalkan status sudah diminum"
            >
              <Ionicons name="arrow-undo" size={13} color="#64748B" />
              <Text style={styles.undoBtnText}>Batal</Text>
            </TouchableOpacity>
          </View>
        ) : isSkipped ? (
          // Skipped state
          <View style={styles.skippedRow}>
            <View style={styles.skippedStatusBadge}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
              <Text style={styles.skippedStatusText}>Jadwal dilewati</Text>
            </View>
            <TouchableOpacity
              style={styles.takeNowSmallBtn}
              onPress={() => onMarkAsTaken(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.takeNowSmallText}>Minum Sekarang</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Pending / Due action buttons
          <View style={styles.pendingActionsRow}>
            <View style={styles.secondaryActionsGroup}>
              <TouchableOpacity
                style={styles.snoozeBtn}
                onPress={() => onSnooze(item, 15)}
                activeOpacity={0.7}
                accessibilityLabel="Tunda pengingat 15 menit"
              >
                <Ionicons name="timer-outline" size={14} color="#64748B" />
                <Text style={styles.secondaryBtnText}>Tunda</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => onSkip(item)}
                activeOpacity={0.7}
                accessibilityLabel="Lewati jadwal obat"
              >
                <Ionicons name="close-outline" size={14} color="#64748B" />
                <Text style={styles.secondaryBtnText}>Lewati</Text>
              </TouchableOpacity>
            </View>

            {/* Primary 'Minum' Button */}
            <TouchableOpacity
              style={[
                styles.primaryTakeBtn,
                isDue ? styles.primaryTakeBtnDue : styles.primaryTakeBtnNormal,
              ]}
              onPress={() => onMarkAsTaken(item)}
              activeOpacity={0.85}
              accessibilityLabel={`Catat sudah minum ${medicine.name}`}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.primaryTakeBtnText}>Sudah Minum</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardNormal: {
    borderColor: '#E2E8F0',
  },
  cardDue: {
    borderColor: '#0D9488',
    borderWidth: 1.5,
  },
  cardOverdue: {
    borderColor: '#FDE68A',
  },
  cardTaken: {
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
    opacity: 0.85,
  },
  dueTopBar: {
    height: 3,
    backgroundColor: '#0D9488',
  },
  cardContent: {
    padding: 14,
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timeBadge: {
    width: 60,
    height: 58,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  timeBadgeNormal: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  timeBadgeDue: {
    backgroundColor: '#0D9488',
    borderColor: '#0F766E',
  },
  timeBadgeOverdue: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  timeBadgeTaken: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  timeTextWhite: {
    color: '#FFFFFF',
  },
  timeTextDark: {
    color: '#0F172A',
  },
  timeTextTaken: {
    color: '#059669',
  },
  timeStatusLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  detailsContainer: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  medName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  medNameTaken: {
    color: '#475569',
    textDecorationLine: 'line-through',
  },
  medDose: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  stockTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockTagNormal: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stockTagWarning: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  stockTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  stockTagTextWarning: {
    color: '#B45309',
    fontWeight: '700',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 10,
  },
  noteText: {
    fontSize: 11,
    color: '#0F766E',
    flex: 1,
    fontStyle: 'italic',
  },
  actionsDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginTop: 10,
    marginBottom: 10,
  },
  takenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  takenStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  takenStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  undoBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  skippedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skippedStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skippedStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  takeNowSmallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#0D9488',
  },
  takeNowSmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pendingActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  secondaryActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  snoozeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  primaryTakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    flex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  primaryTakeBtnDue: {
    backgroundColor: '#0D9488',
  },
  primaryTakeBtnNormal: {
    backgroundColor: '#10B981',
  },
  primaryTakeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
