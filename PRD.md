# Product Requirements Document (PRD)
**Sistem Informasi Manajemen Terpadu Lab IFP (SIM-IFP)**

## 1. Pendahuluan
**1.1 Latar Belakang**
Interactive Flat Panel (IFP) merupakan sarana digitalisasi pembelajaran interaktif. Dalam lingkup sekolah reguler maupun penyelenggara kelas terbuka, pemanfaatan IFP perlu diatur secara adil, aman, dan akuntabel guna mendukung pembelajaran reguler maupun layanan tutorial/remedial bagi siswa kelas terbuka.

**1.2 Tujuan Produk (Product Objective)**
Membangun sebuah sistem informasi berbasis web yang memusatkan seluruh kegiatan terkait IFP: mulai dari pengaturan jadwal, log pemanfaatan, pelaporan kendala (troubleshooting), hingga penyimpanan media pembelajaran agar selaras dengan Standar Operasional Prosedur (SOP) sekolah.

**1.3 Metrik Kesuksesan**
- 100% penggunaan IFP tercatat melalui log digital sistem.
- Tidak ada jadwal penggunaan (Kelas Reguler & Kelas Terbuka) yang bentrok (conflict-free scheduling).
- Media pembelajaran yang digunakan terpusat dan tervalidasi minimal 80% per semester.
- Laporan Monev dapat diekspor secara instan oleh pihak manajemen sekolah (Kepala Sekolah/Waka).

---

## 2. Target Pengguna (User Personas)
Sistem ini akan diakses oleh beberapa tingkatan pengguna (Roles):
1. **Admin / Tim TIK**: Memiliki akses penuh untuk mengelola pengguna, memvalidasi materi/media, menyetujui jadwal insidental, dan mengelola data aset (inventaris & perbaikan).
2. **Waka Kurikulum / Kepala Sekolah**: Memiliki akses ke *Dashboard Monev* untuk memantau grafik penggunaan, melihat log bukti, dan mengunduh laporan.
3. **Guru (Kelas Reguler) / Tutor (Kelas Terbuka)**: Pengguna utama yang akan membooking jadwal, mengisi log pemanfaatan, mengunggah bukti/evidence mengajar, serta mengunggah atau mengunduh media pembelajaran dari repositori.
4. **Siswa (Opsional)**: Akses terbatas (mungkin hanya *Read-Only* atau mengakses materi dari repositori yang telah dibagikan).

---

## 3. Kebutuhan Fungsional (Functional Requirements)

Berdasarkan analisis SOP (SOP 1 - SOP 7), berikut adalah penjabaran modul fungsional:

### 3.1 Modul Penjadwalan & Booking
- **FR 1.1**: Sistem harus menampilkan kalender interaktif yang membedakan jadwal Kelas Reguler dan Kelas Terbuka.
- **FR 1.2**: Guru/Tutor dapat mengajukan *booking* jadwal insidental melalui formulir pengajuan.
- **FR 1.3**: Admin/Kurikulum dapat menyetujui (Approve) atau menolak (Reject) permintaan jadwal insidental.
- **FR 1.4**: Sistem harus memberikan peringatan (conflict prevention) apabila jadwal yang diajukan bertabrakan dengan jadwal yang sudah ada.

### 3.2 Modul Log Penggunaan
- **FR 2.1**: Sistem menyediakan *form log penggunaan* untuk diisi guru setelah selesai mengajar (mencakup: Waktu, Nama Guru, Mapel, Topik).
- **FR 2.2**: Sistem mewajibkan unggah *evidence* (foto kegiatan/file ekspor *whiteboard* IFP) saat submit log penggunaan.
- **FR 2.3**: Sistem dapat menghasilkan *QR Code* statis per ruangan yang, jika di-scan oleh guru, langsung mengarah ke halaman pengisian log untuk ruang/IFP tersebut.

### 3.3 Modul Manajemen Aset (5P) & Ticketing
- **FR 3.1**: Sistem menyimpan data master *Inventory IFP* (ID Perangkat, Lokasi Ruang, Spesifikasi, Status Kondisi).
- **FR 3.2**: Tim TIK dapat mencatat log perawatan/pemeliharaan berkala (checklist rutin).
- **FR 3.3**: Guru dapat membuat tiket pelaporan kendala/kerusakan (*Ticketing System*) untuk IFP tertentu, dan sistem dapat melacak status penyelesaiannya (Open, In Progress, Closed).

### 3.4 Repositori Media Pembelajaran
- **FR 4.1**: Guru dapat mengunggah file media (PDF, Video, Tautan, PPT interaktif) lengkap dengan metadata (Mapel, Kelas).
- **FR 4.2**: Media yang diunggah harus melewati tahap *Validasi* oleh Admin/Kurikulum sebelum dapat diakses oleh publik/guru lain.
- **FR 4.3**: Direktori media memiliki fitur *search* dan *filter* untuk memudahkan pencarian bahan ajar.

### 3.5 Modul Pelatihan & Kompetensi
- **FR 5.1**: Sistem menyediakan laman statis (*Knowledge Base*) berisi FAQ, Quick Guide, dan Dokumen SOP yang dapat didownload.
- **FR 5.2**: Admin dapat mencatat daftar guru yang telah lulus pelatihan/In House Training (IHT) penggunaan IFP.

### 3.6 Dashboard Monitoring & Evaluasi (Monev)
- **FR 6.1**: Sistem menampilkan visualisasi data berupa grafik batang/pie chart terkait tingkat pemanfaatan IFP per minggu/bulan.
- **FR 6.2**: Sistem menampilkan metrik top pengguna (guru) dan top mata pelajaran yang memanfaatkan IFP.
- **FR 6.3**: Tersedia fitur ekspor (*Download to PDF/Excel*) untuk seluruh data log penggunaan, laporan aset, dan statistik bulanan.

---

## 4. Kebutuhan Non-Fungsional (Non-Functional Requirements)
1. **Keamanan (Security)**: Harus dilengkapi otentikasi login yang aman, perlindungan terhadap file *upload* (membatasi tipe file dan mencegah malware dari bahan ajar).
2. **Ketersediaan & Aksesibilitas**: Antarmuka web harus responsif (Mobile-Friendly) agar guru dapat dengan mudah mengisi log dari smartphone mereka setelah kelas selesai.
3. **Performa (Performance)**: Dashboard laporan harus dapat di-load dengan cepat tanpa *lagging*, walaupun jumlah log data penggunaan sudah sangat banyak (pagination wajib pada tabel).

## 5. Rencana Fase Rilis (Milestones)
- **Fase 1 (MVP - Minimum Viable Product)**: Sistem Autentikasi Pengguna, Kalender Penjadwalan, dan Form Log Penggunaan + Unggah Bukti.
- **Fase 2**: Modul Repositori Media Pembelajaran & Sistem Validasi.
- **Fase 3**: Modul Manajemen Aset (Ticketing) & Pelatihan Kompetensi.
- **Fase 4**: Dashboard Monev & Fitur Ekspor Laporan Lanjutan.
