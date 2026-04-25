const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── DB Helpers ───────────────────────────────────────────────────────────────
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { karyawan: [], absensi: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getTime() {
  return new Date().toTimeString().split(' ')[0].substring(0, 5);
}

// ─── Seed data ────────────────────────────────────────────────────────────────
function seedIfEmpty() {
  const db = readDB();
  if (db.karyawan.length === 0) {
    db.karyawan = [
      { id: 1, nik: 'K001', nama: 'Budi Santoso', jabatan: 'Manager', departemen: 'IT', aktif: true },
      { id: 2, nik: 'K002', nama: 'Siti Rahayu', jabatan: 'Developer', departemen: 'IT', aktif: true },
      { id: 3, nik: 'K003', nama: 'Ahmad Fauzi', jabatan: 'Designer', departemen: 'Kreatif', aktif: true },
      { id: 4, nik: 'K004', nama: 'Dewi Lestari', jabatan: 'HR Officer', departemen: 'HR', aktif: true },
      { id: 5, nik: 'K005', nama: 'Rizki Pratama', jabatan: 'Analyst', departemen: 'Keuangan', aktif: true },
    ];
    writeDB(db);
  }
}

seedIfEmpty();

// ─── KARYAWAN Routes ──────────────────────────────────────────────────────────
app.get('/api/karyawan', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.karyawan });
});

app.get('/api/karyawan/:id', (req, res) => {
  const db = readDB();
  const k = db.karyawan.find(x => x.id == req.params.id);
  if (!k) return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
  res.json({ success: true, data: k });
});

app.post('/api/karyawan', (req, res) => {
  const db = readDB();
  const { nik, nama, jabatan, departemen } = req.body;
  if (!nik || !nama || !jabatan || !departemen)
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  if (db.karyawan.find(x => x.nik === nik))
    return res.status(409).json({ success: false, message: 'NIK sudah terdaftar' });
  const newId = db.karyawan.length ? Math.max(...db.karyawan.map(x => x.id)) + 1 : 1;
  const karyawan = { id: newId, nik, nama, jabatan, departemen, aktif: true };
  db.karyawan.push(karyawan);
  writeDB(db);
  res.status(201).json({ success: true, data: karyawan, message: 'Karyawan berhasil ditambahkan' });
});

app.put('/api/karyawan/:id', (req, res) => {
  const db = readDB();
  const idx = db.karyawan.findIndex(x => x.id == req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
  db.karyawan[idx] = { ...db.karyawan[idx], ...req.body };
  writeDB(db);
  res.json({ success: true, data: db.karyawan[idx], message: 'Data berhasil diupdate' });
});

app.delete('/api/karyawan/:id', (req, res) => {
  const db = readDB();
  const idx = db.karyawan.findIndex(x => x.id == req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
  db.karyawan.splice(idx, 1);
  writeDB(db);
  res.json({ success: true, message: 'Karyawan berhasil dihapus' });
});

// ─── ABSENSI Routes ───────────────────────────────────────────────────────────
app.get('/api/absensi', (req, res) => {
  const db = readDB();
  const { tanggal, karyawan_id, bulan } = req.query;
  let data = db.absensi;
  if (tanggal) data = data.filter(x => x.tanggal === tanggal);
  if (karyawan_id) data = data.filter(x => x.karyawan_id == karyawan_id);
  if (bulan) data = data.filter(x => x.tanggal.startsWith(bulan));
  // Enrich with karyawan info
  const enriched = data.map(a => {
    const k = db.karyawan.find(x => x.id === a.karyawan_id);
    return { ...a, karyawan: k || null };
  });
  res.json({ success: true, data: enriched });
});

app.post('/api/absensi/masuk', (req, res) => {
  const db = readDB();
  const { karyawan_id } = req.body;
  const k = db.karyawan.find(x => x.id == karyawan_id);
  if (!k) return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
  const today = getToday();
  const existing = db.absensi.find(x => x.karyawan_id == karyawan_id && x.tanggal === today);
  if (existing && existing.jam_masuk)
    return res.status(409).json({ success: false, message: 'Sudah absen masuk hari ini' });

  const jam = getTime();
  const newId = db.absensi.length ? Math.max(...db.absensi.map(x => x.id)) + 1 : 1;
  // Terlambat jika masuk setelah 08:30
  const status = jam > '08:30' ? 'terlambat' : 'hadir';
  const absensi = {
    id: newId, karyawan_id: parseInt(karyawan_id),
    tanggal: today, jam_masuk: jam, jam_keluar: null, status, keterangan: ''
  };
  db.absensi.push(absensi);
  writeDB(db);
  res.status(201).json({ success: true, data: { ...absensi, karyawan: k }, message: `Absen masuk berhasil pukul ${jam}` });
});

app.post('/api/absensi/keluar', (req, res) => {
  const db = readDB();
  const { karyawan_id } = req.body;
  const today = getToday();
  const idx = db.absensi.findIndex(x => x.karyawan_id == karyawan_id && x.tanggal === today);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Belum absen masuk hari ini' });
  if (db.absensi[idx].jam_keluar)
    return res.status(409).json({ success: false, message: 'Sudah absen keluar hari ini' });
  const jam = getTime();
  db.absensi[idx].jam_keluar = jam;
  writeDB(db);
  const k = db.karyawan.find(x => x.id == karyawan_id);
  res.json({ success: true, data: { ...db.absensi[idx], karyawan: k }, message: `Absen keluar berhasil pukul ${jam}` });
});

app.post('/api/absensi/izin', (req, res) => {
  const db = readDB();
  const { karyawan_id, keterangan, tanggal } = req.body;
  const k = db.karyawan.find(x => x.id == karyawan_id);
  if (!k) return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
  const tgl = tanggal || getToday();
  const existing = db.absensi.find(x => x.karyawan_id == karyawan_id && x.tanggal === tgl);
  if (existing) return res.status(409).json({ success: false, message: 'Sudah ada data absensi untuk tanggal ini' });
  const newId = db.absensi.length ? Math.max(...db.absensi.map(x => x.id)) + 1 : 1;
  const absensi = {
    id: newId, karyawan_id: parseInt(karyawan_id),
    tanggal: tgl, jam_masuk: null, jam_keluar: null, status: 'izin',
    keterangan: keterangan || 'Izin'
  };
  db.absensi.push(absensi);
  writeDB(db);
  res.status(201).json({ success: true, data: { ...absensi, karyawan: k }, message: 'Izin berhasil dicatat' });
});

// ─── REKAP Routes ─────────────────────────────────────────────────────────────
app.get('/api/rekap', (req, res) => {
  const db = readDB();
  const { bulan } = req.query; // format: YYYY-MM
  const target = bulan || getToday().substring(0, 7);
  const rekap = db.karyawan.map(k => {
    const data = db.absensi.filter(a => a.karyawan_id === k.id && a.tanggal.startsWith(target));
    const hadir = data.filter(a => a.status === 'hadir').length;
    const terlambat = data.filter(a => a.status === 'terlambat').length;
    const izin = data.filter(a => a.status === 'izin').length;
    const alpha = data.filter(a => a.status === 'alpha').length;
    return { karyawan: k, hadir, terlambat, izin, alpha, total: data.length };
  });
  res.json({ success: true, data: rekap, bulan: target });
});

app.get('/api/stats', (req, res) => {
  const db = readDB();
  const today = getToday();
  const absensiHari = db.absensi.filter(x => x.tanggal === today);
  res.json({
    success: true,
    data: {
      total_karyawan: db.karyawan.length,
      hadir_hari_ini: absensiHari.filter(x => x.status === 'hadir' || x.status === 'terlambat').length,
      izin_hari_ini: absensiHari.filter(x => x.status === 'izin').length,
      belum_absen: db.karyawan.length - absensiHari.length,
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
