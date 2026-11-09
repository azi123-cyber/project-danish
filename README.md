# Medikita - Pengingat Minum Obat Harian & Pelacak Stok

Aplikasi mobile Android & iOS berbasis **React Native + Expo SDK 58** untuk pengingat jadwal minum obat harian, pelacak sisa stok obat otomatis, dan laporan kepatuhan terapi.

## 🚀 Fitur Utama

- **100% Offline & Local Storage**: Semua data obat, riwayat kepatuhan, stok, dan pengaturan disimpan langsung di memori HP pengguna menggunakan `@react-native-async-storage/async-storage`. **Tidak memerlukan backend, server, ataupun API key eksternal**.
- **Notifikasi Lokal Real**: Menggunakan `expo-notifications` yang menjadwalkan alarm dan pemberitahuan langsung pada sistem operasi ponsel pengguna.
- **Getar & Suara**: Integrasi haptic feedback menggunakan `expo-haptics` saat aksi minum obat atau pengingat berbunyi.
- **UI/UX Mobile Ergonomis**:
  - **Jadwal (Timeline)**: Pemilih tanggal, filter (Semua, Belum, Sudah), kartu obat dengan status waktu (Pagi, Siang, Sore, Malam), tombol "Sudah Minum", "Tunda 15 Menit", "Lewati", dan fitur "Batal/Undo".
  - **Kotak Obat (Cabinet)**: Pencarian obat, status stok menipis, isi ulang cepat (+10, +20, +30), sakelar aktif/jeda, serta ubah & hapus obat.
  - **Riwayat & Laporan**: Grafik kepatuhan 7 hari terakhir, persentase disiplin minum obat, streak hari berturut-turut, dan audit log lengkap.
  - **Modal Tambah/Ubah Obat**: Dilengkapi templat obat umum (Paracetamol, Amoxicillin, Antasida, Vitamin C, Metformin, Cetirizine), pilihan bentuk (Tablet, Kapsul, Sirup, dll), aturan makan, jadwal jam fleksibel, dan pilihan warna label.

---

## 📱 Cara Menjalankan di Expo Go

Buka terminal di folder project ini:

```bash
npx expo start -c
```

1. Buka aplikasi **Expo Go** di HP Android atau iOS Anda.
2. Scan kode QR yang muncul di terminal (atau buka URL `exp://...`).
3. Aplikasi akan langsung berjalan tanpa kendala dan tanpa simulasi.

---

## 📦 Cara Membungkus Menjadi APK (Android Standalone)

Karena aplikasi sudah 100% menggunakan arsitektur offline lokal, saat dibungkus menjadi file APK dan diunduh oleh pengguna lain, semua memori obat dan riwayat langsung tersimpan di HP masing-masing tanpa perlu server.

Untuk membungkus APK menggunakan EAS Build:
```bash
npx eas-cli build -p android --profile preview
```
Atau build secara lokal menggunakan:
```bash
npx expo run:android --variant release
```
