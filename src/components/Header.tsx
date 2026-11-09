import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDateIndonesian } from '../utils/medication';

interface HeaderProps {
  currentTime: Date;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTestNotification: () => void;
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTime,
  soundEnabled,
  onToggleSound,
  onTestNotification,
  onOpenAddModal,
}) => {
  const dateStr = currentTime.toISOString().split('T')[0];
  const timeStr = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Brand & Logo */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="medkit" size={20} color="#FFFFFF" />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>Medikita</Text>
              <View style={styles.offlineBadge}>
                <Ionicons name="shield-checkmark" size={10} color="#0D9488" />
                <Text style={styles.offlineText}>Memori Lokal</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>Pengingat Minum Obat Harian</Text>
          </View>
        </View>

        {/* Quick Top Actions */}
        <View style={styles.actionButtonsRow}>
          {/* Sound / Vibration toggle */}
          <TouchableOpacity
            style={[styles.iconButton, soundEnabled ? styles.iconButtonActive : styles.iconButtonInactive]}
            onPress={onToggleSound}
            activeOpacity={0.7}
            accessibilityLabel="Nyalakan atau matikan suara pengingat"
          >
            <Ionicons
              name={soundEnabled ? 'volume-high' : 'volume-mute'}
              size={18}
              color={soundEnabled ? '#0D9488' : '#94A3B8'}
            />
          </TouchableOpacity>

          {/* Test notification button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onTestNotification}
            activeOpacity={0.7}
            accessibilityLabel="Uji coba notifikasi lokal"
          >
            <Ionicons name="notifications-outline" size={18} color="#0D9488" />
          </TouchableOpacity>

          {/* Add Medicine Button */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={onOpenAddModal}
            activeOpacity={0.8}
            accessibilityLabel="Tambah Obat Baru"
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Tambah</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date & Time Live Bar */}
      <View style={styles.timeBar}>
        <View style={styles.timeInfoItem}>
          <Ionicons name="calendar-outline" size={13} color="#64748B" />
          <Text style={styles.timeInfoText}>{formatDateIndonesian(dateStr)}</Text>
        </View>
        <View style={styles.timeDivider} />
        <View style={styles.timeInfoItem}>
          <Ionicons name="time-outline" size={13} color="#0D9488" />
          <Text style={styles.clockText}>{timeStr} WIB</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0D9488',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offlineText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0F766E',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconButtonActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  iconButtonInactive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#0D9488',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  timeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  timeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeInfoText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  timeDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  clockText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
    fontVariant: ['tabular-nums'],
  },
});
