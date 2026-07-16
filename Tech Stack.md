# Technology Stack (Tumpukan Teknologi)
**Sistem Informasi Manajemen Terpadu Lab IFP (SIM-IFP)**

Berdasarkan kebutuhan sistem (PRD) yang mengutamakan kecepatan, keamanan, interaktivitas, dan keandalan, berikut adalah arsitektur teknologi (*Tech Stack*) yang akan digunakan untuk pengembangan SIM-IFP:

---

## 1. Frontend Framework: Next.js
**Next.js** (berbasis React) dipilih sebagai kerangka kerja utama untuk membangun antarmuka web.
- **Alasan Pemilihan**:
  - **Kinerja Tinggi**: Mendukung *Server-Side Rendering (SSR)* dan *Static Site Generation (SSG)* sehingga website akan dimuat dengan sangat cepat, hal ini penting agar guru dapat membuka aplikasi secara instan, terutama dari perangkat *mobile*.
  - **Full-stack Capabilities**: Next.js memiliki fitur *Route Handlers* (API Routes) yang memungkinkan kita membuat *backend API* ringan langsung di dalam satu *codebase* yang sama.
  - **Routing Modern**: Menggunakan arsitektur *App Router* terbaru yang memudahkan navigasi antarmodul (Penjadwalan, Repositori, Dashboard).

## 2. Styling & UI Design: Tailwind CSS
**Tailwind CSS** adalah *utility-first CSS framework* yang akan digunakan untuk merancang antarmuka pengguna (UI).
- **Alasan Pemilihan**:
  - **Pengembangan Cepat**: Memungkinkan kita membangun antarmuka yang sangat responsif, estetis, dan modern secara cepat tanpa harus berpindah-pindah ke file CSS terpisah.
  - **Konsistensi Desain**: Sangat mudah untuk menerapkan *design system* yang konsisten di seluruh halaman.
  - **Responsivitas**: Memudahkan pembuatan desain *Mobile-First*, sehingga website akan tampil sempurna di layar HP guru maupun layar besar IFP.

## 3. Database & Backend-as-a-Service (BaaS): Supabase
**Supabase** (alternatif *open-source* dari Firebase) dipilih sebagai penyedia *database* dan layanan *backend*.
- **Alasan Pemilihan**:
  - **PostgreSQL Database**: Supabase berjalan di atas PostgreSQL, sebuah database relasional yang sangat kuat, stabil, dan cocok untuk menyimpan data relasional kompleks seperti Jadwal, Log, dan Aset.
  - **Autentikasi Bawaan (Auth)**: Menyediakan sistem otentikasi login/register yang aman sejak awal, mendukung integrasi email/password maupun OAuth (Google, dsb).
  - **Supabase Storage**: Menyediakan layanan *cloud storage* (penyimpanan file) bawaan. Ini sangat vital untuk fitur **Repositori Media Pembelajaran** (menyimpan file PPT, PDF, Video) dan **Log Penggunaan** (mengunggah foto *evidence*).
  - **Realtime**: Kemampuan *real-time* yang berguna jika kita ingin membuat pembaruan status peminjaman jadwal atau *ticketing* secara langsung (*live*).

---

## Kesimpulan Arsitektur
Dengan kombinasi **Next.js + Tailwind CSS + Supabase**, kita mendapatkan tumpukan teknologi modern yang sangat kuat (*Full-Stack Serverless Architecture*). Next.js akan menangani antarmuka dan logika aplikasi, Tailwind CSS memastikan desain terlihat premium, dan Supabase bertindak sebagai pilar utama untuk keamanan data, penyimpanan *database*, dan *file hosting*.
