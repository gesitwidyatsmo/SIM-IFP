# 📐 SIM-IFP DESIGN SYSTEM & UI/UX SPECIFICATION
**Style: Academic Neobrutalism (Neobrutalisme Edukatif)**
*Dokumen Panduan Desain Antarmuka & Pengalaman Pengguna untuk Sistem Informasi Manajemen Terpadu Laboratorium Interactive Flat Panel (SIM-IFP)*

---

## 1. Filosofi & Visi Desain

### 1.1 Konsep: *Academic Neobrutalism* (Neobrutalisme Edukatif)
SIM-IFP dirancang untuk menjembatani operasional teknologi modern (*Interactive Flat Panel*) dengan ekosistem sekolah formal (Sekolah Reguler) dan non-formal inklusif (Kelas Terbuka). Gaya visual yang diterapkan adalah **Academic Neobrutalism**, yaitu perpaduan antara:
1. **Ketegasan & Ketajaman Neobrutalisme**: Garis tepi hitam tegas (*bold black borders*), bayangan jatuh solid (*hard solid drop-shadows*), kontras tinggi, dan tata letak modular geometris.
2. **Karakter Edukatif & Ramah Sekolah (*Educational Warmth*)**: Warna-warna terinspirasi dari alat tulis sekolah (kuning stabilo, biru seragam/tinta, hijau papan tulis, oranye map portofolio, merah stempel), sudut membulat ramah (*rounded corners* 10px–16px), tekstur kertas/grid buku milimeter (*graph paper pattern*), serta metafora fisik seperti stempel verifikasi (*stamps of approval*), tab map berkas (*folder tabs*), dan kartu indeks catatan (*index cards*).

### 1.2 Pilar Pengalaman Pengguna (UX Pillars)
* **Zero Friction for Teachers**: Guru dapat mengisi log kelas dan upload foto papan tulis/evidence hanya dalam < 60 detik dari layar HP mereka langsung setelah jam pelajaran usai.
* **Clarity for Management**: Kepala Sekolah dan Waka Kurikulum dapat membaca status ketersediaan ruang dan grafik monev secara sekilas (*at-a-glance*) tanpa terhalang ornamen visual yang membingungkan.
* **Tactile & Responsive on Large IFP Screens**: Tombol, kartu, dan kontrol interaktif berukuran cukup besar (min. target sentuh 44x44px pada HP dan nyaman disentuh langsung dengan jari atau stylus di layar IFP 65"–86").
* **Fair & Transparent (Kelas Reguler & Kelas Terbuka)**: Alokasi jam pelajaran (JP) dan peruntukan sesi antara kelas reguler dan kelas tutorial terbuka terdistribusi dengan pembedaan visual yang jelas dan tegas.

---

## 2. Palet Warna & Token Desain (Color Palette & Tokens)

Palet warna menggunakan kontras tinggi dengan warna latar bernuansa kertas bersih dan aksen fungsional yang memiliki makna khusus dalam ranah sekolah:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ACADEMIC NEOBRUTALISM PALETTE                   │
├──────────────┬──────────────┬──────────────┬─────────────┬─────────────┤
│ Canvas Paper │ Ink Black    │ Highlighter  │ School Blue │ Chalk Green │
│ #FFFDF5      │ #121212      │ #FFE600      │ #3B82F6     │ #10B981     │
│ (Latar Kertas) (Border/Teks)│ (Aksen Utama)│ (Reguler)   │ (Terbuka)   │
├──────────────┼──────────────┼──────────────┼─────────────┼─────────────┤
│ Folder Coral │ Stamp Red    │ Chalkboard   │ Muted Paper │ Dark Card   │
│ #FB923C      │ #EF4444      │ #1E293B      │ #F4EFE6     │ #FFFFFF     │
│ (Inventaris) │ (Tiket 5P)   │ (Layar IFP)  │ (Sub-panel) │ (Kartu Putih│
└──────────────┴──────────────┴──────────────┴─────────────┴─────────────┘
```

### 2.1 Token Warna Fondasi

| Token Name | Hex Code | Deskripsi & Peruntukan |
| :--- | :--- | :--- |
| `--bg-canvas` | `#FFFDF5` | Latar belakang utama aplikasi (krem kertas hangat, anti silau). |
| `--bg-paper-alt` | `#F4EFE6` | Latar belakang sekunder, sidebar, atau container sub-modul. |
| `--surface-card` | `#FFFFFF` | Latar belakang kartu konten, modal popup, formulir input. |
| `--text-primary` | `#121212` | Warna teks utama, heading, dan garis border utama (solid black). |
| `--text-secondary`| `#4B5563` | Teks keterangan pendukung, label metadata, deskripsi ringkas. |
| `--text-muted` | `#6B7280` | Placeholder input, tanggal sekunder, breadcrumbs. |
| `--border-ink` | `#121212` | Ketebalan border standar (`2px` atau `3px` solid). |
| `--shadow-ink` | `#121212` | Bayangan solid tanpa blur (`box-shadow: 4px 4px 0px #121212`). |

### 2.2 Warna Aksen Semantik & Fungsional Modul

| Modul / Kategori | Hex Code | Nama Warna | Arti Fungsional dalam SIM-IFP |
| :--- | :--- | :--- | :--- |
| **Utama / Highlight** | `#FFE600` | *Highlighter Yellow* | Tombol aksi utama, tab aktif, penanda tanggal hari ini. |
| **Kelas Reguler**      | `#3B82F6` | *Academic Blue* | Sesi jadwal pembelajaran reguler Senin–Kamis & Sabtu. |
| **Kelas Terbuka**      | `#10B981` | *Tutorial Green* | Sesi jadwal layanan tutorial/remedial Kelas Terbuka (Ahad). |
| **Insidental / Ekstra** | `#A855F7` | *Activity Purple* | Sesi rapat guru, ekskul digital, workshop komite. |
| **Tiket / Kerusakan 5P**| `#EF4444` | *Stamp Red* | Pelaporan kendala, tombol bahaya, status rusak/kritis. |
| **Validasi & Status** | `#F59E0B` | *Review Amber* | Status menunggu verifikasi kurikulum (*Pending*). |
| **Media / Repositori** | `#FB923C` | *Folder Orange* | Kategori berkas modul ajar, PPT interaktif, video. |
| **Aset IFP / Hardware** | `#06B6D4` | *Tech Cyan* | Spesifikasi teknis unit layar IFP, kode barcode/QR. |

---

## 3. Tipografi & Skala Hierarki (Typography)

Sistem tipografi memadukan font sans-serif geometris yang tegas dan modern dengan angka monospace untuk jam dan kode tiket.

* **Primary Font Family**: `Plus Jakarta Sans`, `Lexend`, atau `Inter`, sans-serif
* **Display / Accent Headings**: `Plus Jakarta Sans` (Font weight 800/900 dengan tracking ketat `-0.03em`)
* **Technical / Code / JP Font**: `JetBrains Mono`, `Space Mono`, monospace

### 3.1 Skala Tipografi

| Level | Size | Weight | Line Height | Tracking | Contoh Pemakaian |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display H1** | `2.25rem` (36px) | 900 (Black) | 1.15 | `-0.03em` | Judul Halaman Utama Dashboard, Header Landing |
| **Heading H2** | `1.75rem` (28px) | 800 (ExtraBold) | 1.25 | `-0.02em` | Judul Seksi Form, Judul Kalender Bulanan |
| **Heading H3** | `1.25rem` (20px) | 700 (Bold) | 1.3 | `-0.01em` | Judul Kartu Jadwal, Judul Bahan Ajar |
| **Heading H4** | `1.00rem` (16px) | 700 (Bold) | 1.4 | `0` | Sub-judul tabel, nama modul kecil |
| **Body Standard**| `0.875rem` (14px)| 500 (Medium) | 1.5 | `0` | Teks deskripsi, paragraf SOP, teks isi |
| **Body Small** | `0.75rem` (12px) | 600 (SemiBold) | 1.4 | `+0.01em` | Label form, metadata author, waktu JP |
| **Badge / Stamp**| `0.6875rem` (11px)| 800 (ExtraBold) | 1.0 | `+0.08em` | Stempel "DISETUJUI", "OPEN", "JP 1-2" (Uppercase) |
| **Code / Mono** | `0.8125rem` (13px)| 700 (Bold) | 1.2 | `0` | Kode Tiket (`TKT-2026-001`), Kode Aset (`IFP-LAB-01`) |

---

## 4. Sistem Bayangan, Border, & Tekstur Neobrutalism

Karakteristik utama gaya Neobrutalism terletak pada mekanika visual interaktif yang responsif dan bertekstur:

### 4.1 Rumus Border & Hard Shadow

```css
/* 1. Standard Card Container */
.neo-card {
  background-color: #ffffff;
  border: 2.5px solid #121212;
  border-radius: 14px;
  box-shadow: 4px 4px 0px 0px #121212;
}

/* 2. Elevated Interactive Element (Button / Hoverable Card) */
.neo-card-interactive {
  background-color: #ffffff;
  border: 2.5px solid #121212;
  border-radius: 14px;
  box-shadow: 4px 4px 0px 0px #121212;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.neo-card-interactive:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px 0px #121212;
}
.neo-card-interactive:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px 0px #121212;
}

/* 3. Small Tactile Button */
.neo-btn-primary {
  background-color: #ffe600;
  color: #121212;
  font-weight: 800;
  border: 2.5px solid #121212;
  border-radius: 10px;
  box-shadow: 3px 3px 0px 0px #121212;
  transition: all 0.1s ease;
}
.neo-btn-primary:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0px 0px #121212;
}
.neo-btn-primary:active {
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0px 0px #121212;
}
```

### 4.2 Latar Belakang Interaktif (Interactive Mesh Gradient & Ambient Float)
Sebagai pengganti dot grid statis, SIM-IFP mengadopsi latar belakang interaktif berbasis Canvas / SVG fluid mesh yang bereaksi secara organik terhadap pergerakan kursor mouse dan aliran waktu:

```jsx
/* Interactive Mesh Gradient Component (`src/components/InteractiveBackground.jsx`) */
// - Memadukan 5 bola gradien radial warna pastel sekolah (Highlighter Yellow, Academic Blue, Mint Green, Coral, Lavender)
// - Berinterferensi secara dinamis dengan lerp physics terhadap posisi pointer kursor
// - Dilengkapi filter blur tinggi (36px - 48px) untuk menghasilkan transisi warna yang sangat lembut (soft ambient aura)
// - Kartu & komponen Neobrutalism tetap memiliki kontras 100% tajam dan terbaca sempurna di atasnya
```

---

## 5. Komponen Inti Antarmuka (Core Components)

### 5.1 Tombol (Buttons)

1. **Primary Action Button (Kuning Stabilo)**:
   * Class: `bg-[#FFE600] text-black font-extrabold px-5 py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all`
   * Pemakaian: "Tetapkan Jadwal", "Simpan Log", "Unggah Materi", "Login Admin".
2. **Secondary / Neutral Button (Putih Kertas)**:
   * Class: `bg-white text-black font-bold px-4 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#F4EFE6] transition-all`
   * Pemakaian: "Ekspor CSV", "Filter Mapel", "Kembali".
3. **Danger / Urgent Button (Merah Stempel)**:
   * Class: `bg-[#EF4444] text-white font-extrabold px-5 py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all`
   * Pemakaian: "Buat Laporan Kerusakan", "Tolak Materi".
4. **Approve / Success Button (Hijau Apik)**:
   * Class: `bg-[#10B981] text-white font-extrabold px-4 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all`
   * Pemakaian: "Setujui Materi", "Tandai Selesai 5P".

### 5.2 Input Formulir & Dropdown (Form Controls)

Desain form meniru formulir lembar ujian/administrasi sekolah yang rapi, kontras, dan anti-salah input:

* **Field Text / Select / Textarea**:
  * `bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium placeholder:text-gray-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_#FFE600] transition-all`
* **Radio Box Pilihan (Category Selector / Severity)**:
  * Bentuk kotak tablet Neobrutalisme: Ketika terpilih (*checked*), kotak berubah warna dengan bayangan tebal dan border hitam solid.
* **Dropzone Berkas (Foto Evidence & Bahan Ajar)**:
  * Border putus-putus tebal (`border-3 border-dashed border-black rounded-2xl bg-[#FFFDF5] hover:bg-[#FEF9C3]`), dilengkapi icon besar dan label jelas berformat stempel stiker.

### 5.3 Badges, Tags, & Stempel Verifikasi (Academic Stamps)

Stempel status dibuat dengan teks *UPPERCASE*, font tebal, border hitam 2px, dan sedikit rotasi sudut (*micro-tilt* -1.5deg hingga +1.5deg) untuk memberikan efek cap fisik dokumen sekolah:

* **Stempel "DISETUJUI / RESMI"**:
  * `bg-[#D1FAE5] text-[#065F46] border-2 border-black px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] rotate-[-1deg]`
* **Stempel "MENUNGGU TINJAUAN"**:
  * `bg-[#FEF08A] text-[#854D0E] border-2 border-black px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] rotate-[1deg]`
* **Stempel "KENDALA TERBUKA (5P)"**:
  * `bg-[#FEE2E2] text-[#991B1B] border-2 border-black px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]`
* **Pill Jam Pelajaran (JP Tag)**:
  * `bg-[#3B82F6] text-white border-2 border-black px-2 py-0.5 rounded-md font-mono text-xs font-bold`

### 5.4 Bento Stat Boxes (Kotak Ringkasan Informasi)

Bento box menggunakan kombinasi warna berbeda per kategori data untuk meningkatkan kemudahan navigasi mata (*visual hierarchy*):

* **Box 1 (Total Sesi)**: Warna dasar kuning `#FFE600` dengan ikon kalender hitam tebal.
* **Box 2 (Kelas Reguler)**: Warna dasar biru pastel `#DBEAFE` dengan aksen `#1E40AF`.
* **Box 3 (Kelas Terbuka & Ekskul)**: Warna dasar hijau pastel `#D1FAE5` dengan aksen `#065F46`.
* **Box 4 (Tiket Perbaikan 5P)**: Warna dasar merah muda pastel `#FEE2E2` dengan aksen `#991B1B`.

---

## 6. Spesifikasi Desain Antarmuka per Halaman

### 6.1 Layout Global & Sidebar Navigasi (Buku Agenda Sekolah)
* **Sidebar**:
  * Tampil seperti punggung buku agenda sekolah / map binder berkas.
  * Latar belakang: `#F4EFE6` dengan border kanan `3px solid #121212`.
  * Logo Sekolah / SIM-IFP: Lambang monitor interaktif dengan badge kuning *"LAB IFP TERPADU"*.
  * Item Menu: Tombol kotak berpola tab folder (`border-2 border-transparent hover:border-black hover:bg-white hover:shadow-[3px_3px_0px_0px_#000] rounded-xl font-bold`).
  * Item Menu Aktif: Berwarna kuning stabilo `#FFE600` dengan border hitam 2.5px dan bayangan `3px 3px 0px #000`.
  * User Footer: Kotak profil berbingkai hitam, membedakan badge *ADMIN TIK*, *WAKA KURIKULUM*, *GURU INDUK*, *TUTOR TERBUKA*, atau *AKSES PUBLIK*.

### 6.2 Halaman Utama: Kalender & Ketersediaan IFP (`/dashboard`)
* **Header**:
  * Headline tebal: *"Jadwal Penggunaan Interactive Flat Panel"*.
  * Banner pengumuman: Gaya *post-it note* kuning berisi ringkasan sesi hari ini.
* **Komponen Kalender Interaktif**:
  * Split-panel layout: Sisi kiri kalender bulanan (grid 7 hari), sisi kanan daftar mata pelajaran/kegiatan pada tanggal terpilih.
  * Hari Jumat: Diberi tanda visual khusus bergaris miring (*striped pattern*) bertuliskan *"JUMAT LIBUR"*.
  * Hari Ahad: Diberi badge hijau khusus *"SESI KELAS TERBUKA"*.
  * Slot Kegiatan: Kartu berborder hitam tebal menampilkan Jam Pelajaran (contoh: `JP 3 - 4 | 08:35 - 09:55`), Nama Guru, Mata Pelajaran, Kelas, dan Ruangan Lab.

### 6.3 Halaman Formulir Alokasi & Booking Jadwal (`/dashboard/booking`)
* **Struktur Formulir 3 Langkah Terstruktur**:
  1. *Langkah 1 (Pilih Unit IFP)*: Kartu pemilihan radio unit IFP (Lab Putra, Lab Putri, Ruang Kelas) dengan indikator status kondisi alat (Bagus/Siap Pakai).
  2. *Langkah 2 (Pilih Tanggal & Alokasi JP)*: Pemilih Jam Pelajaran otomatis (JP 1 sampai 7) yang langsung menghitung jam mulai dan selesai. Jika jadwal bentrok, kotak peringatan merah Neobrutalism bergetar halus (*shake micro-animation*) dengan pesan konflik yang jelas.
  3. *Langkah 3 (Detail Pembelajaran)*: Pilihan kategori (Pembelajaran Reguler, Tutorial Terbuka, Ekskul, Rapat), Kelas, Mapel, dan Catatan Kebutuhan Khusus (misal: "Memerlukan stylus pen ekstra dan audio aktif").

### 6.4 Halaman Log Digital & Unggah Bukti Mengajar (`/dashboard/log`)
* **Formulir Buku Tamu Digital Pasca-Kelas**:
  * Dirancang *mobile-first* agar dapat diakses dari smartphone guru dengan cepat saat jam istirahat.
  * Form isian: Nama Guru, Unit IFP, Mata Pelajaran, dan Ringkasan Materi Interaktif.
  * Input Jam Realisasi: Penyesuaian waktu selesai aktual.
  * Area Unggah Evidence: Komponen kamera langsung / galeri file untuk foto siswa berinteraksi di IFP atau hasil ekspor file whiteboard PDF.
  * Tombol Submit: Kuning menyala dengan teks tegas *"SIMPAN LOG & SELESAIKAN KELAS"*.

### 6.5 Halaman Repositori Bahan Ajar Interaktif (`/dashboard/repository`)
* **Bilah Pencarian & Filter Cepat**:
  * Search input besar berbayangan solid.
  * Filter pills berbasis Mapel (*IPA, IPS, Matematika, Informatika, dll.*) dan Tingkat Kelas (*Kelas 7, 8, 9, Umum*).
* **Kartu Bahan Ajar (Media Card)**:
  * Tampil seperti sampul modul berkas pelajaran.
  * Icon tipe berkas berwarna mencolok: PDF (Merah), PPT/Presentasi (Kuning Oranye), Video Interaktif (Biru).
  * Metadata pengunggah dan tanggal rilis.
  * Tombol aksi: *"Unduh / Buka Materi"* (Neobrutalist button putih dengan hover bayangan tebal).

### 6.6 Halaman Ticketing Kerusakan & Troubleshooting 5P (`/dashboard/tickets`)
* **Daftar Tiket Kendala**:
  * Format kartu tiket dengan efek garis sobekan nota (*ticket perforation dash line*).
  * Kode Tiket Monospace: `TKT-2026-001`.
  * Severity Badge: Kritis (Merah), Sedang (Oranye), Ringan (Kuning).
  * Status Penanganan: *OPEN* (Merah), *IN PROGRESS* (Kuning), *CLOSED* (Hijau).
  * Tombol Aksi Admin: Tombol sekali klik untuk mengubah status pengerjaan oleh tim sarpras.

### 6.7 Halaman Validasi Materi Kurikulum (`/dashboard/validation`)
* **Tabel Antrean Validasi Berkas**:
  * Desain tabel bergaya lembar arsip (*ledger sheet*).
  * Kolom: Judul Materi, Mapel & Kelas, Guru Pengunggah, Preview File, dan Aksi Cepat.
  * Tombol Aksi Bersanding: Tombol Hijau Berstempel Checklist (Setujui) dan Tombol Merah Berstempel Silang (Tolak/Revisi).

### 6.8 Halaman Statistik & Dashboard Monev (`/dashboard/monev`)
* **Visualisasi Data Penggunaan IFP**:
  * Grafik Batang Recharts yang disesuaikan dengan tema Neobrutalism (batang berwarna solid, tooltip berborder hitam solid dengan bayangan tegas).
  * Indikator Distribusi Hari Pembelajaran (Senin s.d. Ahad).
  * Baris Aksi Ekspor: Tombol *"Ekspor Data CSV"* (Hijau muda) dan Tombol *"Cetak Dokumen Laporan / PDF"* (Kuning terang).
  * Format Cetak (Print View): Mengoptimalkan layout ke format A4 landscape resmi sekolah tanpa elemen navigasi website yang tidak perlu.

### 6.9 Halaman Portal Login Admin (`/login`)
* **Kartu Autentikasi Pengelola**:
  * Terpusat di tengah layar dengan background kertas bergrid dot.
  * Kartu putih besar berborder hitam tebal `3px` dan bayangan solid `6px 6px 0px #000`.
  * Icon gembok/perisai sekolah dengan badge *"PORTAL TIK & KURIKULUM"*.
  * Tautan cepat kembali ke dashboard publik tanpa login untuk mempermudah guru yang hanya ingin melihat jadwal.

---

## 7. Desain Responsif & Pertimbangan Layar IFP

### 7.1 Breakpoints

| Breakpoint | Ukuran Layar | Target Perangkat | Penyesuaian Tata Letak |
| :--- | :--- | :--- | :--- |
| **Mobile (`< 768px`)** | Smartphone Guru (360px - 430px) | Isi log kelas, buat tiket kendala cepat, cek jadwal hari ini | Sidebar tersembunyi (*drawer hamburger*), kartu jadwal vertikal 1 kolom, tombol ukuran sentuh jempol. |
| **Tablet / Laptop (`768px - 1280px`)** | Laptop Guru & Admin Sekolah | Input jadwal booking, upload bahan ajar, review validasi | Sidebar statis, kalender split-view 2 kolom, tabel data responsif dengan scroll horizontal halus. |
| **Large Display (`> 1280px` & Layar IFP)** | Layar IFP 65"–86" di Ruang Lab & Layar PC Kurikulum | Tampilan display kelas interaktif, presentasi jadwal live | Ukuran font lebih terbaca dari jarak 3 meter, target sentuh stylus ekstra presisi, padding leluasa. |

---

## 8. Panduan Implementasi Kode (Tailwind CSS v4 Classes)

Berikut adalah ringkasan kelas utilitas Tailwind CSS v4 siap pakai untuk menerapkan gaya Academic Neobrutalism ke seluruh modul SIM-IFP:

```html
<!-- 1. KARTU NEOBRUTALISM STANDAR -->
<div class="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
  ...
</div>

<!-- 2. KARTU INTERAKTIF DENGAN HOVER LIFT -->
<div class="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] transition-all">
  ...
</div>

<!-- 3. TOMBOL AKSI UTAMA (KUNING STABILO) -->
<button class="bg-[#FFE600] text-black font-extrabold text-sm px-5 py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center cursor-pointer">
  Simpan Data
</button>

<!-- 4. INPUT TEKS FORM -->
<input 
  type="text" 
  class="w-full bg-white border-2 border-black rounded-xl px-4 py-2.5 text-black font-semibold placeholder:text-gray-400 shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:shadow-[4px_4px_0px_0px_#FFE600] transition-all"
/>

<!-- 5. STEMPEL STATUS DISETUJUI -->
<span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#D1FAE5] text-[#065F46] border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
  ✓ Disetujui
</span>

<!-- 6. KOTAK BENTO STATISTIK -->
<div class="bg-[#FEF08A] border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] flex items-start space-x-4">
  <div class="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
    <!-- Icon -->
  </div>
  <div>
    <p class="text-xs font-black uppercase tracking-wider text-black/70">Total Sesi Bulan Ini</p>
    <p class="text-3xl font-black text-black mt-1">28 <span class="text-sm font-bold">Sesi</span></p>
  </div>
</div>
```

---

## 9. Kesimpulan & Manfaat bagi Institusi Sekolah

Penerapan **Academic Neobrutalism** pada SIM-IFP memberikan keuntungan langsung bagi seluruh pemangku kepentingan sekolah:
1. **Meningkatkan Kepatuhan Pengisian Log**: Tampilan yang cerah, kontras, dan interaktif memotivasi guru untuk selalu mendokumentasikan pemanfaatan IFP pasca mengajar.
2. **Keterbacaan Optimal di Segala Perangkat**: Dari layar HP berukuran kecil hingga panel sentuh 86 inch di depan ruang kelas, informasi jadwal dan status aset terbaca dengan sangat tajam tanpa silau.
3. **Kesesuaian dengan Regulasi & SOP Sekolah**: Setiap alur proses (SOP 1 s.d. SOP 7) terefleksikan dalam visualisasi status yang transparan, profesional, dan berwibawa.
