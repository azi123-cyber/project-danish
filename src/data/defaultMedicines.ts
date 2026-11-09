import { Medicine } from '../types/medication';
import { formatDateKey } from '../utils/medication';

const todayKey = formatDateKey(new Date());

export const DEFAULT_MEDICINES: Medicine[] = [
  {
    id: 'med-paracetamol',
    name: 'Paracetamol',
    dose: '1 Tablet (500 mg)',
    form: 'tablet',
    mealTiming: 'sesudah',
    times: ['07:00', '13:00', '19:00'],
    days: [], // Setiap hari
    color: '#0284c7', // Sky blue
    stock: 14,
    stockAlertThreshold: 5,
    notes: 'Minum bila demam, flu, atau sakit kepala.',
    startDate: todayKey,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med-amoxicillin',
    name: 'Amoxicillin',
    dose: '1 Kapsul (500 mg)',
    form: 'kapsul',
    mealTiming: 'sesudah',
    times: ['08:00', '16:00', '23:00'],
    days: [],
    color: '#d97706', // Amber
    stock: 9,
    stockAlertThreshold: 6,
    notes: 'Antibiotik resep dokter - Harus dihabiskan tepat waktu!',
    startDate: todayKey,
    durationDays: 7,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med-vitamin-c',
    name: 'Vitamin C & Zinc',
    dose: '1 Tablet Effervescent',
    form: 'tablet',
    mealTiming: 'sesudah',
    times: ['08:00'],
    days: [],
    color: '#16a34a', // Emerald green
    stock: 25,
    stockAlertThreshold: 5,
    notes: 'Larutkan dalam segelas air dingin setelah sarapan.',
    startDate: todayKey,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med-amlodipine',
    name: 'Amlodipine',
    dose: '1 Tablet (5 mg)',
    form: 'tablet',
    mealTiming: 'sesudah',
    times: ['21:00'],
    days: [],
    color: '#7c3aed', // Purple
    stock: 18,
    stockAlertThreshold: 5,
    notes: 'Obat pengontrol tekanan darah harian sebelum tidur.',
    startDate: todayKey,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med-antasida',
    name: 'Antasida Doen Suspensi',
    dose: '1 Sendok Takar (5 ml)',
    form: 'sirup',
    mealTiming: 'sebelum',
    times: ['06:30', '12:30'],
    days: [],
    color: '#0d9488', // Teal
    stock: 4, // low stock trigger to showcase warning
    stockAlertThreshold: 5,
    notes: 'Kocok dahulu sebelum diminum. 30 menit sebelum makan.',
    startDate: todayKey,
    active: true,
    createdAt: new Date().toISOString(),
  },
];
