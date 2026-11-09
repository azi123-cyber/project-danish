import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import { Medicine, DoseLog, DailyDoseItem } from './src/types/medication';
import {
  formatDateKey,
  formatTimeKey,
  generateDailyDoseList,
  calculateAdherence,
  calculateStreak,
} from './src/utils/medication';
import {
  loadMedicinesFromStorage,
  saveMedicinesToStorage,
  loadLogsFromStorage,
  saveLogsToStorage,
  loadSoundPreference,
  saveSoundPreference,
} from './src/utils/storage';
import {
  requestNotificationPermission,
  scheduleMedicationNotifications,
  triggerTestNotification,
} from './src/utils/notifications';
import {
  triggerSuccessFeedback,
  triggerWarningFeedback,
  triggerSelectionFeedback,
} from './src/utils/soundAndHaptics';

import { Header } from './src/components/Header';
import { DailyProgressCard } from './src/components/DailyProgressCard';
import { TimelineTab } from './src/components/TimelineTab';
import { MedicineCabinetTab } from './src/components/MedicineCabinetTab';
import { HistoryTab } from './src/components/HistoryTab';
import { MedicineModal } from './src/components/MedicineModal';
import { ActiveDueBanner } from './src/components/ActiveDueBanner';
import { BottomTabBar, AppTab } from './src/components/BottomTabBar';
import { Toast, ToastMessage } from './src/components/Toast';

export default function App() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentTab, setCurrentTab] = useState<AppTab>('timeline');
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    formatDateKey(new Date())
  );

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [logs, setLogs] = useState<DoseLog[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Active floating reminder modal/banner
  const [activeDueItem, setActiveDueItem] = useState<DailyDoseItem | null>(null);

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // In-app Toast message
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Prevent multiple alarm sounds in the same minute
  const alertedAlarmsRef = useRef<Set<string>>(new Set());

  // Load persisted local data on app mount
  useEffect(() => {
    async function initData() {
      const storedMeds = await loadMedicinesFromStorage();
      const storedLogs = await loadLogsFromStorage();
      const storedSound = await loadSoundPreference();

      setMedicines(storedMeds);
      setLogs(storedLogs);
      setSoundEnabled(storedSound);
      setIsLoaded(true);

      // Request notification permissions & sync local reminders
      await requestNotificationPermission();
      await scheduleMedicationNotifications(storedMeds);
    }
    initData();
  }, []);

  // Save medicines to local storage whenever modified
  useEffect(() => {
    if (!isLoaded) return;
    saveMedicinesToStorage(medicines);
    scheduleMedicationNotifications(medicines);
  }, [medicines, isLoaded]);

  // Save logs to local storage whenever modified
  useEffect(() => {
    if (!isLoaded) return;
    saveLogsToStorage(logs);
  }, [logs, isLoaded]);

  // Save sound setting
  useEffect(() => {
    if (!isLoaded) return;
    saveSoundPreference(soundEnabled);
  }, [soundEnabled, isLoaded]);

  // Real-time clock tick every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // In-app live reminder check: fires active due banner when clock matches scheduled dose
  useEffect(() => {
    if (!isLoaded) return;

    const todayStr = formatDateKey(currentTime);
    const timeStr = formatTimeKey(currentTime);

    medicines.forEach((med) => {
      if (!med.active) return;

      med.times.forEach((scheduledTime) => {
        const alarmKey = `${todayStr}_${scheduledTime}_${med.id}`;

        if (scheduledTime === timeStr && !alertedAlarmsRef.current.has(alarmKey)) {
          alertedAlarmsRef.current.add(alarmKey);

          const alreadyLogged = logs.some(
            (l) =>
              l.medicineId === med.id &&
              l.scheduledTime === scheduledTime &&
              l.scheduledDate === todayStr
          );

          if (!alreadyLogged) {
            triggerWarningFeedback(soundEnabled);
            setActiveDueItem({
              id: `${med.id}_${scheduledTime}_${todayStr}`,
              medicine: med,
              time: scheduledTime,
              date: todayStr,
              isTaken: false,
              isSkipped: false,
              isDue: true,
              isOverdue: false,
              isUpcoming: false,
              displayTime: scheduledTime,
            });
          }
        }
      });
    });
  }, [currentTime, medicines, logs, soundEnabled, isLoaded]);

  // Auto clear toast after 3.5s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Generated dose occurrences for selected date
  const dailyDoses = useMemo(() => {
    const timeStr = formatTimeKey(currentTime);
    return generateDailyDoseList(medicines, selectedDate, logs, timeStr);
  }, [medicines, selectedDate, logs, currentTime]);

  // Metrics
  const adherencePercentage = useMemo(() => {
    const totalScheduled = dailyDoses.length;
    const takenCount = dailyDoses.filter((d) => d.isTaken).length;
    return calculateAdherence(totalScheduled, takenCount);
  }, [dailyDoses]);

  const streakDays = useMemo(() => {
    return calculateStreak(medicines, logs, formatDateKey(currentTime));
  }, [medicines, logs, currentTime]);

  const lowStockMedicines = useMemo(() => {
    return medicines.filter((m) => m.active && m.stock <= m.stockAlertThreshold);
  }, [medicines]);

  const pendingDosesTodayCount = useMemo(() => {
    return dailyDoses.filter((d) => !d.isTaken && !d.isSkipped).length;
  }, [dailyDoses]);

  // Handlers
  const handleMarkAsTaken = (item: DailyDoseItem) => {
    const newLog: DoseLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      medicineId: item.medicine.id,
      scheduledTime: item.time,
      scheduledDate: item.date,
      status: 'taken',
      takenAt: new Date().toISOString(),
    };

    setLogs((prev) => [
      ...prev.filter(
        (l) =>
          !(
            l.medicineId === item.medicine.id &&
            l.scheduledTime === item.time &&
            l.scheduledDate === item.date
          )
      ),
      newLog,
    ]);

    // Decrement stock by 1
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === item.medicine.id && m.stock > 0) {
          return { ...m, stock: m.stock - 1 };
        }
        return m;
      })
    );

    triggerSuccessFeedback(soundEnabled);

    if (
      activeDueItem?.medicine.id === item.medicine.id &&
      activeDueItem.time === item.time
    ) {
      setActiveDueItem(null);
    }

    setToast({
      title: 'Tercatat Sudah Minum',
      desc: `${item.medicine.name} (${item.medicine.dose}) tepat waktu. Stok berkurang -1.`,
      type: 'success',
    });
  };

  const handleUndoTaken = (item: DailyDoseItem) => {
    setLogs((prev) =>
      prev.filter(
        (l) =>
          !(
            l.medicineId === item.medicine.id &&
            l.scheduledTime === item.time &&
            l.scheduledDate === item.date
          )
      )
    );

    // Restore stock
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === item.medicine.id) {
          return { ...m, stock: m.stock + 1 };
        }
        return m;
      })
    );

    triggerSelectionFeedback(soundEnabled);

    setToast({
      title: 'Status Dibatalkan',
      desc: `Status minum ${item.medicine.name} dikembalikan dan stok dipulihkan +1.`,
      type: 'info',
    });
  };

  const handleSnooze = (item: DailyDoseItem, minutes: number) => {
    setActiveDueItem(null);
    triggerSelectionFeedback(soundEnabled);
    setToast({
      title: `Pengingat Ditunda ${minutes} Menit`,
      desc: `Jadwal ${item.medicine.name} akan diingatkan kembali.`,
      type: 'info',
    });
  };

  const handleSkip = (item: DailyDoseItem) => {
    const newLog: DoseLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      medicineId: item.medicine.id,
      scheduledTime: item.time,
      scheduledDate: item.date,
      status: 'skipped',
      skippedReason: 'Dilewati oleh pengguna',
    };

    setLogs((prev) => [
      ...prev.filter(
        (l) =>
          !(
            l.medicineId === item.medicine.id &&
            l.scheduledTime === item.time &&
            l.scheduledDate === item.date
          )
      ),
      newLog,
    ]);

    if (
      activeDueItem?.medicine.id === item.medicine.id &&
      activeDueItem.time === item.time
    ) {
      setActiveDueItem(null);
    }

    triggerWarningFeedback(soundEnabled);

    setToast({
      title: 'Jadwal Dilewati',
      desc: `Jadwal obat ${item.medicine.name} jam ${item.time} dilewati untuk hari ini.`,
      type: 'warning',
    });
  };

  const handleSaveMedicine = (
    medData: Omit<Medicine, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setMedicines((prev) =>
        prev.map((m) =>
          m.id === existingId
            ? { ...medData, id: existingId, createdAt: m.createdAt }
            : m
        )
      );
      setToast({
        title: 'Obat Diperbarui',
        desc: `Data ${medData.name} berhasil disimpan di memori lokal HP.`,
        type: 'success',
      });
    } else {
      const newMed: Medicine = {
        ...medData,
        id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };
      setMedicines((prev) => [...prev, newMed]);
      setToast({
        title: 'Obat Ditambahkan',
        desc: `${medData.name} siap diingatkan sesuai jadwal harian.`,
        type: 'success',
      });
    }
    triggerSuccessFeedback(soundEnabled);
  };

  const handleDeleteMedicine = (id: string) => {
    const target = medicines.find((m) => m.id === id);
    if (!target) return;
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    triggerSelectionFeedback(soundEnabled);
    setToast({
      title: 'Obat Dihapus',
      desc: `${target.name} telah dihapus dari daftar obat.`,
      type: 'info',
    });
  };

  const handleToggleActive = (id: string) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const next = !m.active;
          setToast({
            title: next ? 'Pengingat Diaktifkan' : 'Pengingat Dijeda',
            desc: `${m.name} sekarang ${next ? 'aktif' : 'dijeda sementara'}.`,
            type: 'info',
          });
          return { ...m, active: next };
        }
        return m;
      })
    );
    triggerSelectionFeedback(soundEnabled);
  };

  const handleQuickRefill = (id: string, amount: number) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = m.stock + amount;
          setToast({
            title: 'Stok Bertambah',
            desc: `Stok ${m.name} +${amount} (total sekarang: ${updated} dosis).`,
            type: 'success',
          });
          return { ...m, stock: updated };
        }
        return m;
      })
    );
    triggerSuccessFeedback(soundEnabled);
  };

  const handleResetLogs = () => {
    setLogs([]);
    triggerSelectionFeedback(soundEnabled);
    setToast({
      title: 'Riwayat Dikosongkan',
      desc: 'Semua catatan konsumsi obat telah direset.',
      type: 'info',
    });
  };

  const handleTestNotification = async () => {
    await triggerTestNotification();
    triggerSuccessFeedback(soundEnabled);
    setToast({
      title: 'Notifikasi Lokal Dikirim',
      desc: 'Alarm pengingat lokal berhasil diuji coba pada perangkat Anda.',
      type: 'info',
    });
  };

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    triggerSelectionFeedback(nextVal);
    setToast({
      title: nextVal ? 'Suara & Getar Aktif' : 'Suara & Getar Dibisukan',
      desc: nextVal
        ? 'Aplikasi akan bergetar dan membunyikan alarm saat jadwal tiba.'
        : 'Aplikasi tidak akan bergetar atau bersuara.',
      type: 'info',
    });
  };

  const handleOpenAddModal = () => {
    setEditingMedicine(null);
    setIsModalOpen(true);
  };

  const handleEditMedicine = (med: Medicine) => {
    setEditingMedicine(med);
    setIsModalOpen(true);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ExpoStatusBar style="dark" />

        {/* In-app Toast message */}
        <Toast toast={toast} onDismiss={() => setToast(null)} />

        {/* Top Active Due Banner (when dose is currently due) */}
        <ActiveDueBanner
          dueItem={activeDueItem}
          onMarkAsTaken={handleMarkAsTaken}
          onSnooze={handleSnooze}
          onDismiss={() => setActiveDueItem(null)}
        />

        {/* App Header */}
        <Header
          currentTime={currentTime}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onTestNotification={handleTestNotification}
          onOpenAddModal={handleOpenAddModal}
        />

        {/* Scrollable Main Content */}
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Daily Progress Card (Always visible on all tabs for quick glance) */}
          <DailyProgressCard
            doses={dailyDoses}
            adherencePercentage={adherencePercentage}
            streakDays={streakDays}
            lowStockMedicines={lowStockMedicines}
            onNavigateToCabinet={() => {
              triggerSelectionFeedback(soundEnabled);
              setCurrentTab('cabinet');
            }}
          />

          {/* Current Tab Screen */}
          {currentTab === 'timeline' && (
            <TimelineTab
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              doses={dailyDoses}
              onMarkAsTaken={handleMarkAsTaken}
              onUndoTaken={handleUndoTaken}
              onSnooze={handleSnooze}
              onSkip={handleSkip}
              onOpenAddModal={handleOpenAddModal}
            />
          )}

          {currentTab === 'cabinet' && (
            <MedicineCabinetTab
              medicines={medicines}
              onOpenAddModal={handleOpenAddModal}
              onEditMedicine={handleEditMedicine}
              onDeleteMedicine={handleDeleteMedicine}
              onToggleActive={handleToggleActive}
              onQuickRefill={handleQuickRefill}
            />
          )}

          {currentTab === 'history' && (
            <HistoryTab
              medicines={medicines}
              logs={logs}
              onResetLogs={handleResetLogs}
            />
          )}
        </ScrollView>

        {/* Bottom Tab Bar */}
        <BottomTabBar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            triggerSelectionFeedback(soundEnabled);
            setCurrentTab(tab);
          }}
          pendingDosesCount={pendingDosesTodayCount}
        />

        {/* Medicine Add/Edit Modal */}
        <MedicineModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveMedicine}
          editingMedicine={editingMedicine}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainScrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainScrollContent: {
    paddingBottom: 24,
  },
});
