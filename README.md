# 📋 SiAbsen — Sistem Absensi Karyawan

Sistem absensi karyawan lengkap dengan **Backend (Node.js/Express)** dan **Frontend (HTML/CSS/JS)**.

---

## 📁 Struktur Project

```
absensi/
├── backend/
│   ├── server.js       ← API Server (Express)
│   ├── package.json    ← Dependencies
│   └── db.json         ← Database (auto-created)
└── frontend/
    └── index.html      ← Aplikasi Web
```

---

## 🚀 Cara Menjalankan

### 1. Install dependencies & jalankan backend
```bash
cd backend
npm install
node server.js
```
Server akan berjalan di: **http://localhost:3000**

### 2. Buka frontend
Buka file `frontend/index.html` di browser, **ATAU** akses langsung melalui:
**http://localhost:3000** (backend sudah serve frontend otomatis)

---

## 🔌 API Endpoints

### Karyawan
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | /api/karyawan | List semua karyawan |
| GET | /api/karyawan/:id | Detail karyawan |
| POST | /api/karyawan | Tambah karyawan |
| PUT | /api/karyawan/:id | Update karyawan |
| DELETE | /api/karyawan/:id | Hapus karyawan |

### Absensi
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | /api/absensi | List absensi (filter: tanggal, karyawan_id, bulan) |
| POST | /api/absensi/masuk | Absen masuk |
| POST | /api/absensi/keluar | Absen keluar |
| POST | /api/absensi/izin | Input izin |

### Rekap & Stats
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | /api/rekap?bulan=YYYY-MM | Rekap bulanan per karyawan |
| GET | /api/stats | Statistik hari ini |

---

## ✨ Fitur

- **Dashboard** — Statistik real-time & absensi hari ini
- **Absen Cepat** — Masuk / Keluar / Izin dengan satu klik
- **Data Karyawan** — CRUD lengkap
- **Riwayat Absensi** — Filter by tanggal & karyawan
- **Rekap Bulanan** — Rekapitulasi per karyawan
- **Deteksi terlambat** — Otomatis jika masuk setelah 08:30
- **Database JSON** — Tidak perlu install database

---

## 📦 Tech Stack

- **Backend**: Node.js, Express, CORS
- **Database**: JSON file (db.json)
- **Frontend**: Vanilla HTML/CSS/JS (tanpa framework)
- **Font**: Sora + JetBrains Mono (Google Fonts)
"# sistem-absensi" 
