# Database Schema (Skema Database)
**Sistem Informasi Manajemen Terpadu Lab IFP (SIM-IFP)**

Berikut adalah rancangan struktur tabel *database* relasional (PostgreSQL) yang akan digunakan di **Supabase**.

---

## 1. Tabel `profiles` (Data Pengguna)
Supabase memiliki tabel bawaan `auth.users` untuk menyimpan email & password. Tabel `profiles` ini akan terhubung langsung dengan `auth.users` untuk menyimpan data profil tambahan.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | *Primary Key*, relasi ke `auth.users.id`. |
| `full_name` | `VARCHAR` | Nama lengkap guru/admin. |
| `role` | `ENUM` | Peran pengguna: `'ADMIN'`, `'GURU'`, `'TUTOR'`, `'KEPALA_SEKOLAH'`. |
| `created_at` | `TIMESTAMP` | Waktu akun dibuat. |

---

## 2. Tabel `ifp_assets` (Data Perangkat IFP)
Menyimpan daftar inventaris *Interactive Flat Panel*.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | *Primary Key*. |
| `asset_code` | `VARCHAR` | Kode unik inventaris (misal: IFP-001). |
| `room_location` | `VARCHAR` | Lokasi penempatan (misal: Ruang Kelas 7A, Ruang IFP). |
| `status` | `ENUM` | Kondisi alat: `'BAGUS'`, `'PERBAIKAN'`, `'RUSAK'`. |
| `created_at` | `TIMESTAMP` | - |
| `updated_at` | `TIMESTAMP` | - |

---

## 3. Tabel `schedules` (Penjadwalan / Booking)
Menyimpan riwayat dan rencana peminjaman/penggunaan IFP.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | *Primary Key*. |
| `ifp_asset_id` | `UUID` | *Foreign Key*, mengacu ke `ifp_assets.id`. |
| `user_id` | `UUID` | *Foreign Key*, mengacu ke `profiles.id` (peminjam). |
| `title` | `VARCHAR` | Judul kegiatan (misal: "IPA Kelas 8"). |
| `start_time` | `TIMESTAMP` | Waktu mulai. |
| `end_time` | `TIMESTAMP` | Waktu selesai. |
| `type` | `ENUM` | Jenis: `'REGULER_INDUK'`, `'TUTORIAL_TERBUKA'`, `'INSIDENTAL'`. |
| `status` | `ENUM` | Status persetujuan (khusus Insidental): `'PENDING'`, `'APPROVED'`, `'REJECTED'`. |
| `notes` | `TEXT` | Catatan tambahan (opsional). |

---

## 4. Tabel `usage_logs` (Buku Tamu / Log Penggunaan)
Form yang diisi guru setelah selesai menggunakan IFP (wajib unggah bukti).

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | *Primary Key*. |
| `schedule_id` | `UUID` | *Foreign Key*, relasi ke `schedules.id` (bisa *null* jika penggunaan mendadak). |
| `ifp_asset_id` | `UUID` | *Foreign Key*, mengacu ke `ifp_assets.id`. |
| `user_id` | `UUID` | *Foreign Key*, mengacu ke `profiles.id` (pengguna). |
| `subject` | `VARCHAR` | Mata Pelajaran. |
| `topic` | `VARCHAR` | Topik/Materi yang diajarkan. |
| `evidence_url` | `VARCHAR` | Tautan/Path file foto kegiatan yang diunggah ke *Supabase Storage*. |
| `created_at` | `TIMESTAMP` | Waktu log dibuat. |

---

## 5. Tabel `tickets` (Pelaporan Kendala / Troubleshooting)
Modul pelaporan jika IFP mengalami masalah teknis (ticketing 5P).

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | *Primary Key*. |
| `ifp_asset_id` | `UUID` | *Foreign Key*, mengacu ke `ifp_assets.id` yang rusak. |
| `reported_by` | `UUID` | *Foreign Key*, mengacu ke `profiles.id` (pelapor). |
| `issue_desc` | `TEXT` | Deskripsi kerusakan. |
| `status` | `ENUM` | Status penanganan: `'OPEN'`, `'IN_PROGRESS'`, `'CLOSED'`. |
| `created_at` | `TIMESTAMP` | Waktu laporan dibuat. |
| `resolved_at` | `TIMESTAMP` | Waktu masalah selesai ditangani (bisa *null*). |

---

## 6. Tabel `media_repository` (Pusat Bahan Ajar)
Menyimpan metadata dan *link* dari materi interaktif yang diunggah.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | *Primary Key*. |
| `uploader_id` | `UUID` | *Foreign Key*, mengacu ke `profiles.id`. |
| `title` | `VARCHAR` | Nama materi (misal: "Materi Tata Surya Interaktif"). |
| `subject` | `VARCHAR` | Mata pelajaran. |
| `grade_level` | `VARCHAR` | Kelas (misal: "Kelas 7"). |
| `file_url` | `VARCHAR` | Tautan/Path dokumen di *Supabase Storage*. |
| `status` | `ENUM` | Status validasi materi: `'PENDING_VALIDATION'`, `'APPROVED'`, `'REJECTED'`. |
| `created_at` | `TIMESTAMP` | - |

---

## 7. Tabel `training_records` (Catatan Pelatihan)
Untuk memantau kompetensi guru (SOP 6).

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | *Primary Key*. |
| `user_id` | `UUID` | *Foreign Key*, mengacu ke `profiles.id` (peserta). |
| `training_name` | `VARCHAR` | Nama pelatihan (misal: "IHT IFP Dasar"). |
| `completed_date` | `DATE` | Tanggal selesai pelatihan. |
| `certificate_url`| `VARCHAR` | Tautan bukti/sertifikat (jika ada, opsional). |

---

### ERD (Entity Relationship Diagram) Gambaran Kasar
Setiap **Pengguna (Profiles)** dapat memilik banyak **Jadwal (Schedules)**, membuat banyak **Log (Usage Logs)**, mengunggah banyak **Materi (Media)**, dan membuat **Tiket (Tickets)**.
Setiap **IFP Asset** memiliki banyak riwayat Jadwal, Log Penggunaan, dan Tiket kendala yang melekat pada alat tersebut.
