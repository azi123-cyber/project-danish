import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Medicine } from '../types/medication';
import { getMealTimingLabel, getFormLabel } from '../utils/medication';

interface MedicineCabinetTabProps {
  medicines: Medicine[];
  onOpenAddModal: () => void;
  onEditMedicine: (medicine: Medicine) => void;
  onDeleteMedicine: (id: string) => void;
  onToggleActive: (id: string) => void;
  onQuickRefill: (id: string, amount: number) => void;
}

export const MedicineCabinetTab: React.FC<MedicineCabinetTabProps> = ({
  medicines,
  onOpenAddModal,
  onEditMedicine,
  onDeleteMedicine,
  onToggleActive,
  onQuickRefill,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.dose.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalCount = medicines.length;
  const activeCount = medicines.filter((m) => m.active).length;
  const lowStockCount = medicines.filter(
    (m) => m.active && m.stock <= m.stockAlertThreshold
  ).length;

  const handleDeletePrompt = (med: Medicine) => {
    Alert.alert(
      'Hapus Obat',
      `Apakah Anda yakin ingin menghapus ${med.name} dari daftar kotak obat?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => onDeleteMedicine(med.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Banner & Add Button */}
      <View style={styles.headerCard}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Kotak Obat Digital</Text>
          <Text style={styles.headerSub}>
            Kelola stok dan jadwal minum obat rutin harian Anda.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addMedBtn}
          onPress={onOpenAddModal}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addMedBtnText}>Tambah Obat</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>{totalCount}</Text>
          <Text style={styles.metricLabel}>Total Obat</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricVal, { color: '#0D9488' }]}>{activeCount}</Text>
          <Text style={styles.metricLabel}>Obat Aktif</Text>
        </View>
        <View style={styles.metricCard}>
          <Text
            style={[
              styles.metricVal,
              { color: lowStockCount > 0 ? '#DC2626' : '#10B981' },
            ]}
          >
            {lowStockCount}
          </Text>
          <Text style={styles.metricLabel}>Stok Menipis</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama obat, dosis, atau catatan..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Medicines List */}
      {filteredMedicines.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="medkit-outline" size={32} color="#0D9488" />
          </View>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'Obat Tidak Ditemukan' : 'Kotak Obat Masih Kosong'}
          </Text>
          <Text style={styles.emptySub}>
            {searchQuery
              ? `Tidak ada obat yang cocok dengan pencarian "${searchQuery}".`
              : 'Tambahkan obat pertama Anda agar jadwal pengingat dapat aktif.'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              style={styles.addEmptyBtn}
              onPress={onOpenAddModal}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addEmptyBtnText}>Tambah Obat Sekarang</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.medsList}>
          {filteredMedicines.map((med) => {
            const isLowStock = med.stock <= med.stockAlertThreshold;

            return (
              <View
                key={med.id}
                style={[
                  styles.medCard,
                  !med.active && styles.medCardInactive,
                  isLowStock && med.active && styles.medCardLowStock,
                ]}
              >
                {/* Top Row: Name, Form, and Switch */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardTitleGroup}>
                    <View
                      style={[
                        styles.colorTag,
                        { backgroundColor: med.color || '#0D9488' },
                      ]}
                    />
                    <View style={styles.nameBlock}>
                      <Text style={styles.medicineName} numberOfLines={1}>
                        {med.name}
                      </Text>
                      <Text style={styles.medicineDose}>{med.dose}</Text>
                    </View>
                  </View>

                  {/* Toggle Active Switch */}
                  <View style={styles.switchGroup}>
                    <Text
                      style={[
                        styles.switchLabel,
                        { color: med.active ? '#0D9488' : '#94A3B8' },
                      ]}
                    >
                      {med.active ? 'Aktif' : 'Dijeda'}
                    </Text>
                    <Switch
                      value={med.active}
                      onValueChange={() => onToggleActive(med.id)}
                      trackColor={{ false: '#E2E8F0', true: '#99F6E4' }}
                      thumbColor={med.active ? '#0D9488' : '#94A3B8'}
                      style={styles.switchControl}
                    />
                  </View>
                </View>

                {/* Tags Row: Form & Meal Timing */}
                <View style={styles.medTagsRow}>
                  <View style={styles.medTag}>
                    <Ionicons name="medical-outline" size={11} color="#64748B" />
                    <Text style={styles.medTagText}>{getFormLabel(med.form)}</Text>
                  </View>

                  <View style={styles.medTag}>
                    <Ionicons name="restaurant-outline" size={11} color="#64748B" />
                    <Text style={styles.medTagText}>
                      {getMealTimingLabel(med.mealTiming)}
                    </Text>
                  </View>
                </View>

                {/* Scheduled Times List */}
                <View style={styles.timesSection}>
                  <Text style={styles.timesLabel}>Jadwal Minum:</Text>
                  <View style={styles.timesChipsRow}>
                    {med.times.map((t) => (
                      <View key={t} style={styles.timeChip}>
                        <Ionicons name="alarm-outline" size={11} color="#0D9488" />
                        <Text style={styles.timeChipText}>{t} WIB</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Stock Meter & Quick Refills */}
                <View style={styles.stockSection}>
                  <View style={styles.stockHeaderRow}>
                    <View style={styles.stockCountGroup}>
                      <Ionicons
                        name="cube-outline"
                        size={13}
                        color={isLowStock ? '#DC2626' : '#64748B'}
                      />
                      <Text style={styles.stockTitle}>Sisa Stok:</Text>
                      <Text
                        style={[
                          styles.stockVal,
                          isLowStock && styles.stockValWarning,
                        ]}
                      >
                        {med.stock} dosis
                      </Text>
                    </View>

                    {isLowStock && (
                      <View style={styles.lowStockBadge}>
                        <Text style={styles.lowStockBadgeText}>Menipis</Text>
                      </View>
                    )}
                  </View>

                  {/* Quick Refill Buttons (+10, +20, +30) */}
                  <View style={styles.quickRefillRow}>
                    <Text style={styles.quickRefillLabel}>Tambah Stok:</Text>
                    <TouchableOpacity
                      style={styles.refillBtn}
                      onPress={() => onQuickRefill(med.id, 10)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.refillBtnText}>+10</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.refillBtn}
                      onPress={() => onQuickRefill(med.id, 20)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.refillBtnText}>+20</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.refillBtn}
                      onPress={() => onQuickRefill(med.id, 30)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.refillBtnText}>+30</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Notes if any */}
                {med.notes ? (
                  <View style={styles.medNoteBox}>
                    <Text style={styles.medNoteText}>"{med.notes}"</Text>
                  </View>
                ) : null}

                {/* Card Actions: Edit & Delete */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.editActionBtn}
                    onPress={() => onEditMedicine(med)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={14} color="#0D9488" />
                    <Text style={styles.editActionText}>Ubah Data</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteActionBtn}
                    onPress={() => handleDeletePrompt(med)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={14} color="#DC2626" />
                    <Text style={styles.deleteActionText}>Hapus</Text>
                  </TouchableOpacity>
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
  headerLeft: {
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
  addMedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  addMedBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    padding: 0,
  },
  medsList: {
    gap: 12,
  },
  medCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
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
  medCardInactive: {
    opacity: 0.65,
    backgroundColor: '#F8FAFC',
  },
  medCardLowStock: {
    borderColor: '#FDE68A',
    borderWidth: 1.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  colorTag: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nameBlock: {
    flex: 1,
  },
  medicineName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  medicineDose: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  switchControl: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  medTagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  medTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  medTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  timesSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    gap: 6,
  },
  timesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  timesChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  stockSection: {
    gap: 6,
  },
  stockHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stockCountGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stockTitle: {
    fontSize: 11,
    color: '#64748B',
  },
  stockVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  stockValWarning: {
    color: '#DC2626',
  },
  lowStockBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lowStockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  quickRefillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickRefillLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  refillBtn: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  refillBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0D9488',
  },
  medNoteBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#0D9488',
  },
  medNoteText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#475569',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  editActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F0FDFA',
  },
  editActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
  },
  deleteActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  deleteActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
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
  addEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0D9488',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  addEmptyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
