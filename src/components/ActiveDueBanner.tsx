import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailyDoseItem } from '../types/medication';
import { getMealTimingLabel } from '../utils/medication';

interface ActiveDueBannerProps {
  dueItem: DailyDoseItem | null;
  onMarkAsTaken: (item: DailyDoseItem) => void;
  onSnooze: (item: DailyDoseItem, minutes: number) => void;
  onDismiss: () => void;
}

export const ActiveDueBanner: React.FC<ActiveDueBannerProps> = ({
  dueItem,
  onMarkAsTaken,
  onSnooze,
  onDismiss,
}) => {
  if (!dueItem) return null;

  return (
    <View style={styles.floatingContainer}>
      <View style={styles.bannerCard}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <View style={styles.alarmBadge}>
              <Ionicons name="notifications" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.alarmTitle}>WAKTUNYA MINUM OBAT!</Text>
              <Text style={styles.timeLabel}>{dueItem.time} WIB</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color="#99F6E4" />
          </TouchableOpacity>
        </View>

        {/* Medicine Details */}
        <View style={styles.detailsBox}>
          <Text style={styles.medName}>{dueItem.medicine.name}</Text>
          <Text style={styles.medDoseMeal}>
            {dueItem.medicine.dose} · {getMealTimingLabel(dueItem.medicine.mealTiming)}
          </Text>
          {dueItem.medicine.notes ? (
            <Text style={styles.medNotes} numberOfLines={2}>
              "{dueItem.medicine.notes}"
            </Text>
          ) : null}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.snoozeBtn}
            onPress={() => onSnooze(dueItem, 15)}
            activeOpacity={0.8}
          >
            <Ionicons name="timer-outline" size={14} color="#CCFBF1" />
            <Text style={styles.snoozeBtnText}>Tunda 15 Mnt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.takeBtn}
            onPress={() => onMarkAsTaken(dueItem)}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle" size={16} color="#0F766E" />
            <Text style={styles.takeBtnText}>Sudah Diminum</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    zIndex: 999,
  },
  bannerCard: {
    backgroundColor: '#0F766E',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#2DD4BF',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alarmBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#5EEAD4',
    letterSpacing: 0.6,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CCFBF1',
  },
  closeBtn: {
    padding: 4,
  },
  detailsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 10,
    gap: 2,
  },
  medName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  medDoseMeal: {
    fontSize: 12,
    color: '#CCFBF1',
    fontWeight: '600',
  },
  medNotes: {
    fontSize: 11,
    color: '#99F6E4',
    fontStyle: 'italic',
    marginTop: 2,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  snoozeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  snoozeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CCFBF1',
  },
  takeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  takeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },
});
