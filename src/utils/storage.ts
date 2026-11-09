import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine, DoseLog } from '../types/medication';
import { DEFAULT_MEDICINES } from '../data/defaultMedicines';

const STORAGE_MEDICINES_KEY = '@medikita_medicines_v2';
const STORAGE_LOGS_KEY = '@medikita_logs_v2';
const STORAGE_SOUND_KEY = '@medikita_sound_v2';

/**
 * Load all medicines from local phone storage.
 * If empty (first launch), initializes with default Indonesian medicines.
 */
export async function loadMedicinesFromStorage(): Promise<Medicine[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_MEDICINES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load medicines from local storage:', err);
  }
  // Default data for new installations
  await saveMedicinesToStorage(DEFAULT_MEDICINES);
  return DEFAULT_MEDICINES;
}

/**
 * Persist medicines array to local phone storage.
 */
export async function saveMedicinesToStorage(medicines: Medicine[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_MEDICINES_KEY, JSON.stringify(medicines));
  } catch (err) {
    console.error('Failed to save medicines to local storage:', err);
  }
}

/**
 * Load dose logs from local phone storage.
 */
export async function loadLogsFromStorage(): Promise<DoseLog[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_LOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load logs from local storage:', err);
  }
  return [];
}

/**
 * Persist dose logs array to local phone storage.
 */
export async function saveLogsToStorage(logs: DoseLog[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save logs to local storage:', err);
  }
}

/**
 * Load sound/vibration preference from local storage.
 */
export async function loadSoundPreference(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_SOUND_KEY);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load sound preference:', err);
  }
  return true;
}

/**
 * Save sound/vibration preference.
 */
export async function saveSoundPreference(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_SOUND_KEY, JSON.stringify(enabled));
  } catch (err) {
    console.error('Failed to save sound preference:', err);
  }
}
