-- ==========================================
-- SCRIPT SQL: SIM-IFP (PostgreSQL / Supabase)
-- ==========================================

-- 1. Buat Tipe ENUM untuk standarisasi data
CREATE TYPE user_role AS ENUM ('ADMIN', 'GURU', 'TUTOR', 'KEPALA_SEKOLAH');
CREATE TYPE asset_status AS ENUM ('BAGUS', 'PERBAIKAN', 'RUSAK');
CREATE TYPE schedule_type AS ENUM ('REGULER_INDUK', 'TUTORIAL_TERBUKA', 'INSIDENTAL');
CREATE TYPE schedule_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');
CREATE TYPE media_status AS ENUM ('PENDING_VALIDATION', 'APPROVED', 'REJECTED');

-- 2. Tabel profiles (Terhubung dengan auth.users bawaan Supabase)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255),
  role user_role DEFAULT 'GURU',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel ifp_assets
CREATE TABLE ifp_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_code VARCHAR(100) UNIQUE NOT NULL,
  room_location VARCHAR(255) NOT NULL,
  status asset_status DEFAULT 'BAGUS',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel schedules (Penjadwalan/Booking)
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ifp_asset_id UUID REFERENCES ifp_assets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  type schedule_type DEFAULT 'INSIDENTAL',
  status schedule_status DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabel usage_logs (Log Penggunaan & Bukti Foto)
CREATE TABLE usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  ifp_asset_id UUID REFERENCES ifp_assets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  evidence_url VARCHAR(1024), -- Menyimpan path gambar dari Supabase Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabel tickets (Pelaporan Kerusakan / 5P)
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ifp_asset_id UUID REFERENCES ifp_assets(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  issue_desc TEXT NOT NULL,
  status ticket_status DEFAULT 'OPEN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 7. Tabel media_repository (Bahan Ajar)
CREATE TABLE media_repository (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uploader_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  grade_level VARCHAR(50),
  file_url VARCHAR(1024) NOT NULL,
  status media_status DEFAULT 'PENDING_VALIDATION',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabel training_records (Pelatihan Guru)
CREATE TABLE training_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  training_name VARCHAR(255) NOT NULL,
  completed_date DATE NOT NULL,
  certificate_url VARCHAR(1024),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- MENGAKTIFKAN RLS (Row Level Security)
-- ==========================================
-- Demi keamanan, matikan akses publik ke tabel dan hanya izinkan yang ter-otentikasi.
-- Note: Policy detail (siapa bisa SELECT/INSERT/UPDATE) dapat Anda konfigurasi 
-- lebih lanjut melalui Dashboard Supabase (Authentication -> Policies).

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ifp_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_repository ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
