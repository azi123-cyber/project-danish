import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailyDoseItem, Medicine } from '../types/medication';

interface DailyProgressCardProps {
  doses: DailyDoseItem[];
  adherencePercentage: number;
  streakDays: number;
  lowStockMedicines: Medicine[];
  onNavigateToCabinet: () => void;
}

export const DailyProgressCard: React.FC<DailyProgressCardProps> = ({
  doses,
  adherencePercentage,
  streakDays,
  lowStockMedicines,
  onNavigateToCabinet,
}) => {
  const totalDoses = doses.length;
  const takenDoses = doses.filter((d) => d.isTaken).length;
  const overdueDoses = doses.filter((d) => d.isOverdue).length;

  return (
    <View style={styles.container}>
      {/* Low Stock Warning Alert if any */}
      {lowStockMedicines.length > 0 && (
        <TouchableOpacity
          style={styles.lowStockBanner}
          onPress={onNavigateToCabinet}
          activeOpacity={0.85}
        >
          <View style={styles.lowStockLeft}>
            <View style={styles.warningIconBadge}>
              <Ionicons name="warning" size={16} color="#B45309" />
            </View>
            <View style={styles.lowStockTextContainer}>
              <Text style={styles.lowStockTitle}>
                Stok Obat Menipis ({lowStockMedicines.length} Obat)
              </Text>
              <Text style={styles.lowStockSub} numberOfLines={1}>
                {lowStockMedicines.map((m) => `${m.name} (sisa ${m.stock})`).join(', ')}
              </Text>
            </View>
          </View>
          <View style={styles.refillActionBtn}>
            <Text style={styles.refillActionText}>Isi</Text>
            <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}

      {/* Main KPI Stats Card */}
      <View style={styles.kpiCard}>
        <View style={styles.kpiRow}>
          {/* Left Column: Progress & Doses */}
          <View style={styles.kpiMainColumn}>
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiLabel}>KEPATUHAN HARI INI</Text>
              {streakDays > 0 && (
                <View style={styles.streakBadge}>
                  <Ionicons name="flame" size={12} color="#EA580C" />
                  <Text style={styles.streakText}>{streakDays} Hari Rutin</Text>
                </View>
              )}
            </View>

            <View style={styles.adherenceScoreRow}>
              <Text style={styles.percentageText}>{adherencePercentage}%</Text>
              <Text style={styles.doseRatioText}>
                ({takenDoses} dari {totalDoses} dosis)
              </Text>
            </View>

            {/* Custom Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.max(4, adherencePercentage)}%`,
                    backgroundColor:
                      adherencePercentage === 100
                        ? '#10B981'
                        : adherencePercentage >= 50
                        ? '#0D9488'
                        : '#F59E0B',
                  },
                ]}
              />
            </View>
          </View>

          {/* Right Column: Status Icon Badge */}
          <View
            style={[
              styles.shieldBadge,
              {
                backgroundColor:
                  adherencePercentage === 100
                    ? '#ECFDF5'
                    : adherencePercentage >= 50
                    ? '#F0FDFA'
                    : '#FFFBEB',
              },
            ]}
          >
            <Ionicons
              name={
                adherencePercentage === 100
                  ? 'checkmark-done-circle'
                  : overdueDoses > 0
                  ? 'alert-circle'
                  : 'shield-checkmark'
              }
              size={28}
              color={
                adherencePercentage === 100
                  ? '#059669'
                  : overdueDoses > 0
                  ? '#D97706'
                  : '#0D9488'
              }
            />
          </View>
        </View>

        {/* Bottom micro stats */}
        <View style={styles.microStatsRow}>
          <View style={styles.microStatItem}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.microStatText}>Sudah: {takenDoses}</Text>
          </View>
          <View style={styles.microStatItem}>
            <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.microStatText}>
              Belum: {totalDoses - takenDoses}
            </Text>
          </View>
          {overdueDoses > 0 && (
            <View style={styles.microStatItem}>
              <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.microStatText, { color: '#DC2626' }]}>
                Terlewat: {overdueDoses}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  lowStockBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lowStockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  warningIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lowStockTextContainer: {
    flex: 1,
  },
  lowStockTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  lowStockSub: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 1,
  },
  refillActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#D97706',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  refillActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  kpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiMainColumn: {
    flex: 1,
    paddingRight: 12,
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#64748B',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  streakText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C2410C',
  },
  adherenceScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  percentageText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  doseRatioText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  shieldBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  microStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  microStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  microStatText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
});
