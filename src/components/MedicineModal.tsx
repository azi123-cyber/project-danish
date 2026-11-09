import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Medicine, MedicineForm, MealTiming } from '../types/medication';
import { formatDateKey } from '../utils/medication';

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    medicine: Omit<Medicine, 'id' | 'createdAt'>,
    existingId?: string
  ) => void;
  editingMedicine?: Medicine | null;
}

const COMMON_PRESETS = [
  {
    name: 'Paracetamol',
    form: 'tablet' as MedicineForm,
    dose: '1 Tablet (500mg)',
    mealTiming: 'sesudah' as MealTiming,
    defaultTimes: ['07:00', '13:00', '19:00'],
  },
  {
    name: 'Amoxicillin',
    form: 'kapsul' as MedicineForm,
    dose: '1 Kapsul (500mg)',
    mealTiming: 'sesudah' as MealTiming,
    defaultTimes: ['08:00', '16:00', '23:00'],
  },
  {
    name: 'Antasida Doen',
    form: 'sirup' as MedicineForm,
    dose: '1 Sendok (5ml)',
    mealTiming: 'sebelum' as MealTiming,
    defaultTimes: ['06:30', '12:30', '18:30'],
  },
  {
    name: 'Vitamin C & Zinc',
    form: 'tablet' as MedicineForm,
    dose: '1 Tablet',
    mealTiming: 'sesudah' as MealTiming,
    defaultTimes: ['08:00'],
  },
  {
    name: 'Metformin',
    form: 'tablet' as MedicineForm,
    dose: '1 Tablet (500mg)',
    mealTiming: 'bersama' as MealTiming,
    defaultTimes: ['07:00', '19:00'],
  },
  {
    name: 'Cetirizine',
    form: 'tablet' as MedicineForm,
    dose: '1 Tablet (10mg)',
    mealTiming: 'bebas' as MealTiming,
    defaultTimes: ['21:00'],
  },
];

const FORMS: { key: MedicineForm; label: string }[] = [
  { key: 'tablet', label: 'Tablet' },
  { key: 'kapsul', label: 'Kapsul' },
  { key: 'sirup', label: 'Sirup' },
  { key: 'tetes', label: 'Tetes' },
  { key: 'salep', label: 'Salep' },
  { key: 'injeksi', label: 'Injeksi' },
  { key: 'serbuk', label: 'Puyer' },
  { key: 'lainnya', label: 'Lainnya' },
];

const MEAL_TIMINGS: { key: MealTiming; label: string }[] = [
  { key: 'sesudah', label: 'Sesudah Makan' },
  { key: 'sebelum', label: 'Sebelum Makan' },
  { key: 'bersama', label: 'Bersama Makan' },
  { key: 'bebas', label: 'Bebas / Kapan Saja' },
];

const COLORS = [
  '#0D9488', // Teal
  '#0284C7', // Sky blue
  '#16A34A', // Green
  '#D97706', // Amber
  '#EA580C', // Orange
  '#DC2626', // Red
  '#7C3AED', // Purple
  '#475569', // Slate
];

const QUICK_TIMES = ['07:00', '08:00', '12:00', '13:00', '18:00', '19:00', '21:00'];

export const MedicineModal: React.FC<MedicineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMedicine,
}) => {
  const [name, setName] = useState('');
  const [dose, setDose] = useState('1 Tablet');
  const [form, setForm] = useState<MedicineForm>('tablet');
  const [mealTiming, setMealTiming] = useState<MealTiming>('sesudah');
  const [times, setTimes] = useState<string[]>(['08:00', '20:00']);
  const [customTime, setCustomTime] = useState('');
  const [stock, setStock] = useState('20');
  const [stockAlertThreshold, setStockAlertThreshold] = useState('5');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#0D9488');

  useEffect(() => {
    if (editingMedicine) {
      setName(editingMedicine.name);
      setDose(editingMedicine.dose);
      setForm(editingMedicine.form);
      setMealTiming(editingMedicine.mealTiming);
      setTimes(editingMedicine.times);
      setStock(String(editingMedicine.stock));
      setStockAlertThreshold(String(editingMedicine.stockAlertThreshold));
      setNotes(editingMedicine.notes || '');
      setColor(editingMedicine.color || '#0D9488');
    } else {
      setName('');
      setDose('1 Tablet');
      setForm('tablet');
      setMealTiming('sesudah');
      setTimes(['08:00', '20:00']);
      setStock('20');
      setStockAlertThreshold('5');
      setNotes('');
      setColor('#0D9488');
    }
  }, [editingMedicine, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof COMMON_PRESETS[0]) => {
    setName(preset.name);
    setDose(preset.dose);
    setForm(preset.form);
    setMealTiming(preset.mealTiming);
    setTimes(preset.defaultTimes);
  };

  const handleAddTime = (timeToAdd: string) => {
    const trimmed = timeToAdd.trim();
    if (!trimmed) return;
    // basic HH:MM validation
    const parts = trimmed.split(':');
    if (parts.length !== 2) {
      Alert.alert('Format Waktu Salah', 'Gunakan format jam 24 jam (misal 08:00 atau 14:30)');
      return;
    }
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      Alert.alert('Format Waktu Salah', 'Jam harus antara 00-23 dan menit antara 00-59');
      return;
    }
    const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    if (!times.includes(formatted)) {
      setTimes([...times, formatted].sort());
    }
    setCustomTime('');
  };

  const handleRemoveTime = (timeToRemove: string) => {
    if (times.length <= 1) {
      Alert.alert('Peringatan', 'Minimal harus ada 1 jadwal jam minum obat.');
      return;
    }
    setTimes(times.filter((t) => t !== timeToRemove));
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validasi', 'Mohon isi nama obat terlebih dahulu.');
      return;
    }
    if (!dose.trim()) {
      Alert.alert('Validasi', 'Mohon isi takaran/dosis obat.');
      return;
    }
    if (times.length === 0) {
      Alert.alert('Validasi', 'Tambahkan minimal satu jadwal jam minum obat.');
      return;
    }

    const parsedStock = parseInt(stock, 10);
    const parsedThreshold = parseInt(stockAlertThreshold, 10);

    const medData: Omit<Medicine, 'id' | 'createdAt'> = {
      name: name.trim(),
      dose: dose.trim(),
      form,
      mealTiming,
      times,
      days: [], // Every day
      color,
      stock: isNaN(parsedStock) ? 20 : parsedStock,
      stockAlertThreshold: isNaN(parsedThreshold) ? 5 : parsedThreshold,
      notes: notes.trim(),
      startDate: editingMedicine ? editingMedicine.startDate : formatDateKey(new Date()),
      active: editingMedicine ? editingMedicine.active : true,
    };

    onSave(medData, editingMedicine?.id);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {editingMedicine ? 'Ubah Data Obat' : 'Tambah Obat Baru'}
              </Text>
              <Text style={styles.modalSub}>
                Semua data tersimpan otomatis di penyimpanan lokal HP Anda.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollBodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Quick Presets (Only when adding new) */}
            {!editingMedicine && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>TEMPLAT CEPAT OBAT UMUM:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.presetsRow}
                >
                  {COMMON_PRESETS.map((p) => (
                    <TouchableOpacity
                      key={p.name}
                      style={styles.presetChip}
                      onPress={() => handleApplyPreset(p)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="sparkles" size={11} color="#0D9488" />
                      <Text style={styles.presetChipText}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Nama Obat */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>NAMA OBAT / SUPLEMEN *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Paracetamol, Vitamin C..."
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Dosis / Takaran */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>DOSIS / TAKARAN *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: 1 Tablet (500mg), 1 Sendok (5ml)..."
                placeholderTextColor="#94A3B8"
                value={dose}
                onChangeText={setDose}
              />
            </View>

            {/* Bentuk Obat */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>BENTUK OBAT</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {FORMS.map((f) => (
                  <TouchableOpacity
                    key={f.key}
                    style={[
                      styles.choiceChip,
                      form === f.key && styles.choiceChipActive,
                    ]}
                    onPress={() => setForm(f.key)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.choiceChipText,
                        form === f.key && styles.choiceChipTextActive,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Aturan Makan */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>ATURAN MINUM</Text>
              <View style={styles.mealOptionsGrid}>
                {MEAL_TIMINGS.map((m) => (
                  <TouchableOpacity
                    key={m.key}
                    style={[
                      styles.mealOptionCard,
                      mealTiming === m.key && styles.mealOptionCardActive,
                    ]}
                    onPress={() => setMealTiming(m.key)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.mealOptionText,
                        mealTiming === m.key && styles.mealOptionTextActive,
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Jadwal Jam Minum */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>JADWAL JAM MINUM ({times.length} WAKTU)</Text>
              <View style={styles.selectedTimesRow}>
                {times.map((t) => (
                  <View key={t} style={styles.selectedTimeChip}>
                    <Ionicons name="time" size={13} color="#0D9488" />
                    <Text style={styles.selectedTimeText}>{t} WIB</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveTime(t)}
                      style={styles.removeTimeBtn}
                    >
                      <Ionicons name="close" size={12} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Quick Add Times */}
              <Text style={styles.subFieldLabel}>Pilih Cepat Jam:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {QUICK_TIMES.map((qt) => (
                  <TouchableOpacity
                    key={qt}
                    style={[
                      styles.quickTimeChip,
                      times.includes(qt) && styles.quickTimeChipDisabled,
                    ]}
                    onPress={() => handleAddTime(qt)}
                    disabled={times.includes(qt)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickTimeChipText}>+{qt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Custom Time Add */}
              <View style={styles.customTimeRow}>
                <TextInput
                  style={[styles.input, styles.customTimeInput]}
                  placeholder="Jam manual (HH:MM misal 14:30)"
                  placeholderTextColor="#94A3B8"
                  value={customTime}
                  onChangeText={setCustomTime}
                  maxLength={5}
                />
                <TouchableOpacity
                  style={styles.addCustomTimeBtn}
                  onPress={() => handleAddTime(customTime)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.addCustomTimeBtnText}>Tambah Jam</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stok & Peringatan */}
            <View style={styles.fieldRowTwoCols}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>SISA STOK (DOSIS)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholder="20"
                  placeholderTextColor="#94A3B8"
                  value={stock}
                  onChangeText={setStock}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>BATAS ALARM MENIPIS</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholder="5"
                  placeholderTextColor="#94A3B8"
                  value={stockAlertThreshold}
                  onChangeText={setStockAlertThreshold}
                />
              </View>
            </View>

            {/* Warna Label */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>WARNA LABEL OBAT</Text>
              <View style={styles.colorsRow}>
                {COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorDotSelect,
                      { backgroundColor: c },
                      color === c && styles.colorDotSelectActive,
                    ]}
                    onPress={() => setColor(c)}
                    activeOpacity={0.7}
                  >
                    {color === c && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Catatan Dokter */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>CATATAN DOKTER / INSTRUKSI KHUSUS</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Contoh: Larutkan dalam air dingin, hindari susu..."
                placeholderTextColor="#94A3B8"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
              />
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Simpan Obat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    maxHeight: 460,
  },
  scrollBodyContent: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  subFieldLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 4,
  },
  presetsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  multilineInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  chipsRow: {
    gap: 6,
    paddingVertical: 2,
  },
  choiceChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  choiceChipActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  choiceChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  choiceChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mealOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  mealOptionCard: {
    flexBasis: '48%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  mealOptionCardActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  mealOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  mealOptionTextActive: {
    color: '#0D9488',
    fontWeight: '800',
  },
  selectedTimesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectedTimeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  selectedTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
  },
  removeTimeBtn: {
    padding: 2,
  },
  quickTimeChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickTimeChipDisabled: {
    opacity: 0.4,
  },
  quickTimeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  customTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  customTimeInput: {
    flex: 1,
  },
  addCustomTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addCustomTimeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fieldRowTwoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  colorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  colorDotSelect: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelectActive: {
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0D9488',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
