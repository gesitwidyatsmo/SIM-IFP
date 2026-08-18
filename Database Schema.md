# Database Schema (Skema Database)
**Sistem Informasi Manajemen Terpadu Lab IFP (SIM-IFP)**

Berikut adalah rancangan struktur tabel *database* relasional (PostgreSQL) yang digunakan di **Supabase**.

---

## 1. Tabel `profiles` (Data Administrator / Pengguna)
Terhubung langsung dengan `auth.users` melalui trigger `on_auth_user_created` untuk menyimpan identitas profil.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | *Primary Key*, relasi ke `auth.users.id`. |
| `full_name` | `VARCHAR(255)` | Nama lengkap admin/pengguna. |
| `email` | `VARCHAR(255)` | Alamat email. |
| `role` | `ENUM` | Peran: `'ADMIN'`, `'GURU'`, `'TUTOR'`, `'KEPALA_SEKOLAH'`. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Waktu akun dibuat. |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | Waktu update profil. |

---

## 2. Tabel `ifp_assets` (Data Perangkat IFP)
Menyimpan daftar inventaris *Interactive Flat Panel*.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | *Primary Key*. |
| `asset_code` | `VARCHAR(100)` | Kode unik inventaris (misal: IFP-LAB-PUTRA, IFP-01). |
| `room_location` | `VARCHAR(255)` | Lokasi penempatan (misal: Lab IFP Putra, Ruang Kelas 7A). |
| `status` | `ENUM` | Kondisi alat: `'BAGUS'`, `'PERBAIKAN'`, `'RUSAK'`. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Waktu registrasi aset. |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | Waktu update status aset. |

---

## 3. Tabel `schedules` (Jadwal Penggunaan IFP)
Menyimpan jadwal penggunaan IFP reguler maupun insidental yang diatur oleh Admin.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | *Primary Key*. |
| `ifp_asset_id` | `UUID` | *Foreign Key*, mengacu ke `ifp_assets.id`. |
| `user_id` | `UUID` | *Foreign Key*, mengacu ke `profiles.id` (opsional). |
| `title` | `VARCHAR(255)` | Topik / Judul kegiatan (misal: "Praktikum Fisika Optik"). |
| `date` | `DATE` | Tanggal kegiatan (Format: YYYY-MM-DD). |
| `start_time` | `VARCHAR(10)` | Waktu mulai (Format: "07:15"). |
| `end_time` | `VARCHAR(10)` | Waktu selesai (Format: "08:35"). |
| `category` | `VARCHAR(100)` | Kategori: `'Pembelajaran'`, `'Ekstrakurikuler'`, `'Rapat Guru'`, `'Lainnya'`. |
| `subject` | `VARCHAR(255)` | Mata Pelajaran (misal: "IPA", "Matematika"). |
| `class_name` | `VARCHAR(100)` | Rombel / Kelas (misal: "9A", "7B"). |
| `type` | `ENUM` | Jenis: `'REGULER_INDUK'`, `'TUTORIAL_TERBUKA'`, `'INSIDENTAL'`. |
| `status` | `ENUM` | Status: `'APPROVED'`, `'PENDING'`, `'REJECTED'`. |
| `notes` | `TEXT` | Catatan tambahan. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Waktu jadwal dibuat. |

---

## 4. Tabel `usage_logs` (Buku Tamu / Log Penggunaan Digital)
Form yang diisi guru setelah selesai menggunakan IFP (disertai unggah bukti foto).

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | *Primary Key*. |
| `schedule_id` | `UUID` | *Foreign Key*, relasi ke `schedules.id` (opsional). |
| `ifp_asset_id` | `UUID` | *Foreign Key*, mengacu ke `ifp_assets.id`. |
| `user_id` | `UUID` | *Foreign Key*, mengacu ke `profiles.id` (opsional). |
| `teacher_name` | `VARCHAR(255)` | Nama guru pengajar. |
| `subject` | `VARCHAR(255)` | Mata Pelajaran. |
| `topic` | `VARCHAR(255)` | Topik/Materi yang diajarkan. |
| `start_time` | `VARCHAR(10)` | Waktu mulai realisasi. |
| `end_time` | `VARCHAR(10)` | Waktu selesai realisasi. |
| `evidence_url` | `VARCHAR(1024)` | Tautan file bukti di Supabase Storage bucket `evidence`. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Waktu log dibuat. |

---

## 5. Tabel `tickets` (Pelaporan Kendala / Troubleshooting 5P)
Modul pelaporan kerusakan IFP oleh guru/murid.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | *Primary Key*. |
| `ticket_code` | `VARCHAR(50)` | Kode tiket unik (misal: "TKT-202608-001"). |
| `ifp_asset_id` | `UUID` | *Foreign Key*, mengacu ke `ifp_assets.id`. |
| `reported_by` | `UUID` | *Foreign Key*, mengacu ke `profiles.id` (opsional). |
| `reporter_name`| `VARCHAR(255)` | Nama pelapor / guru / murid. |
| `issue_desc` | `TEXT` | Deskripsi detail kerusakan/kendala. |
| `severity` | `ENUM` | Tingkat keparahan: `'LOW'`, `'MEDIUM'`, `'HIGH'`. |
| `status` | `ENUM` | Status penanganan: `'OPEN'`, `'IN_PROGRESS'`, `'CLOSED'`. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Waktu laporan dibuat. |
| `resolved_at` | `TIMESTAMP WITH TIME ZONE` | Waktu selesai ditangani. |

---

## 6. Tabel `media_repository` (Pusat Bahan Ajar Interaktif)
Menyimpan berkas dan materi pembelajaran interaktif.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | *Primary Key*. |
| `uploader_id` | `UUID` | *Foreign Key*, mengacu ke `profiles.id` (opsional). |
| `title` | `VARCHAR(255)` | Nama materi. |
| `subject` | `VARCHAR(255)` | Mata pelajaran. |
| `grade_level` | `VARCHAR(50)` | Tingkat kelas (misal: "Kelas 7", "Kelas 8", "Kelas 9", "Umum"). |
| `file_url` | `VARCHAR(1024)` | URL berkas pada bucket `media`. |
| `file_type` | `VARCHAR(20)` | Tipe berkas: `'pdf'`, `'video'`, `'ppt'`. |
| `status` | `ENUM` | Status validasi: `'PENDING_VALIDATION'`, `'APPROVED'`, `'REJECTED'`. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Waktu unggah. |
