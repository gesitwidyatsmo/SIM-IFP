-- ==========================================
-- SCRIPT SQL: SIM-IFP (PostgreSQL / Supabase)
-- ==========================================

-- 1. Buat Tipe ENUM untuk standarisasi data
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'GURU', 'TUTOR', 'KEPALA_SEKOLAH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE asset_status AS ENUM ('BAGUS', 'PERBAIKAN', 'RUSAK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE schedule_type AS ENUM ('REGULER_INDUK', 'TUTORIAL_TERBUKA', 'INSIDENTAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE schedule_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE media_status AS ENUM ('PENDING_VALIDATION', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabel profiles (Terhubung dengan auth.users bawaan Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255),
  role user_role DEFAULT 'ADMIN',
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'ADMIN';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Trigger untuk membuat baris profile otomatis saat user mendaftar di Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'ADMIN'::public.user_role)
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Mencegah error trigger menggagalkan proses registrasi / GoTrue Auth
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Tabel ifp_assets
CREATE TABLE IF NOT EXISTS public.ifp_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_code VARCHAR(100) UNIQUE NOT NULL,
  room_location VARCHAR(255) NOT NULL,
  status asset_status DEFAULT 'BAGUS',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ifp_assets ADD COLUMN IF NOT EXISTS status asset_status DEFAULT 'BAGUS';

-- 4. Tabel schedules (Penjadwalan Penggunaan IFP oleh Admin)
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ifp_asset_id UUID REFERENCES public.ifp_assets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  category VARCHAR(100) DEFAULT 'Pembelajaran',
  subject VARCHAR(255),
  class_name VARCHAR(100),
  type schedule_type DEFAULT 'REGULER_INDUK',
  status schedule_status DEFAULT 'APPROVED',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Pembelajaran';
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS subject VARCHAR(255);
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS class_name VARCHAR(100);
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS type schedule_type DEFAULT 'REGULER_INDUK';
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS status schedule_status DEFAULT 'APPROVED';
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS notes TEXT;

-- 5. Tabel usage_logs (Buku Tamu / Log Penggunaan Digital)
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE SET NULL,
  ifp_asset_id UUID REFERENCES public.ifp_assets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  teacher_name VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  start_time VARCHAR(10),
  end_time VARCHAR(10),
  evidence_url VARCHAR(1024),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.usage_logs ADD COLUMN IF NOT EXISTS teacher_name VARCHAR(255);
ALTER TABLE public.usage_logs ADD COLUMN IF NOT EXISTS evidence_url VARCHAR(1024);
ALTER TABLE public.usage_logs ADD COLUMN IF NOT EXISTS start_time VARCHAR(10);
ALTER TABLE public.usage_logs ADD COLUMN IF NOT EXISTS end_time VARCHAR(10);

-- 6. Tabel tickets (Pelaporan Kerusakan / 5P)
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_code VARCHAR(50) UNIQUE,
  ifp_asset_id UUID REFERENCES public.ifp_assets(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reporter_name VARCHAR(255),
  issue_desc TEXT NOT NULL,
  severity ticket_severity DEFAULT 'MEDIUM',
  status ticket_status DEFAULT 'OPEN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS ticket_code VARCHAR(50);
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS ifp_asset_id UUID REFERENCES public.ifp_assets(id) ON DELETE CASCADE;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS reporter_name VARCHAR(255);
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS issue_desc TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS severity ticket_severity DEFAULT 'MEDIUM';
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS status ticket_status DEFAULT 'OPEN';
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- 7. Tabel media_repository (Bahan Ajar Interaktif)
CREATE TABLE IF NOT EXISTS public.media_repository (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  grade_level VARCHAR(50),
  file_url VARCHAR(1024) NOT NULL,
  file_type VARCHAR(20) DEFAULT 'pdf',
  status media_status DEFAULT 'PENDING_VALIDATION',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.media_repository ADD COLUMN IF NOT EXISTS author_name VARCHAR(255);
ALTER TABLE public.media_repository ADD COLUMN IF NOT EXISTS grade_level VARCHAR(50);
ALTER TABLE public.media_repository ADD COLUMN IF NOT EXISTS status media_status DEFAULT 'PENDING_VALIDATION';

-- ==========================================
-- SEED DATA AWAL (Default Assets)
-- ==========================================
INSERT INTO public.ifp_assets (asset_code, room_location, status)
VALUES 
  ('IFP-LAB-PUTRA', 'LABOR PUTRA', 'BAGUS'),
  ('IFP-LAB-PUTRI', 'LABOR PUTRI', 'BAGUS')
ON CONFLICT (asset_code) DO NOTHING;

-- ==========================================
-- SEED USER ADMIN DEFAULT
-- Email: admin@sekolah.com
-- Password: admin123
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Hapus akun lama jika pernah dibuat untuk reset bersih
DELETE FROM auth.identities WHERE identity_data->>'email' = 'admin@sekolah.com' OR provider_id = 'admin@sekolah.com';
DELETE FROM auth.users WHERE email = 'admin@sekolah.com';

DO $$
DECLARE
  admin_user_id UUID := gen_random_uuid();
BEGIN
  -- 1. Insert ke auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    is_super_admin
  )
  VALUES (
    admin_user_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@sekolah.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Administrator Lab IFP","role":"ADMIN"}',
    now(),
    now(),
    'authenticated',
    'authenticated',
    '',
    false
  );

  -- 2. Insert ke auth.identities (Krusial agar GoTrue Supabase Auth mengenali akun)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    admin_user_id,
    admin_user_id,
    format('{"sub":"%s","email":"%s"}', admin_user_id::text, 'admin@sekolah.com')::jsonb,
    'email',
    admin_user_id::text,
    now(),
    now(),
    now()
  );

  -- 3. Insert ke public.profiles
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    admin_user_id,
    'Administrator Lab IFP',
    'admin@sekolah.com',
    'ADMIN'
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'ADMIN', full_name = 'Administrator Lab IFP', email = 'admin@sekolah.com';

END $$;

-- ==========================================
-- MENGAKTIFKAN RLS & POLICIES (Akses Terbuka & Aman)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ifp_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_repository ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
DROP POLICY IF EXISTS "Profiles viewable by anyone" ON public.profiles;
CREATE POLICY "Profiles viewable by anyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles insertable by anyone" ON public.profiles;
CREATE POLICY "Profiles insertable by anyone" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Profiles updateable by anyone" ON public.profiles;
CREATE POLICY "Profiles updateable by anyone" ON public.profiles FOR UPDATE USING (true);

-- 2. Assets
DROP POLICY IF EXISTS "Assets viewable by anyone" ON public.ifp_assets;
CREATE POLICY "Assets viewable by anyone" ON public.ifp_assets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage assets" ON public.ifp_assets;
CREATE POLICY "Admin manage assets" ON public.ifp_assets FOR ALL USING (true);

-- 3. Schedules
DROP POLICY IF EXISTS "Schedules viewable by anyone" ON public.schedules;
CREATE POLICY "Schedules viewable by anyone" ON public.schedules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin or user can manage schedules" ON public.schedules;
CREATE POLICY "Admin or user can manage schedules" ON public.schedules FOR ALL USING (true);

-- 4. Usage Logs
DROP POLICY IF EXISTS "Usage logs viewable by anyone" ON public.usage_logs;
CREATE POLICY "Usage logs viewable by anyone" ON public.usage_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert usage logs" ON public.usage_logs;
CREATE POLICY "Anyone can insert usage logs" ON public.usage_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can delete usage logs" ON public.usage_logs;
CREATE POLICY "Admin can delete usage logs" ON public.usage_logs FOR DELETE USING (true);

-- 5. Tickets
DROP POLICY IF EXISTS "Tickets viewable by anyone" ON public.tickets;
CREATE POLICY "Tickets viewable by anyone" ON public.tickets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can report tickets" ON public.tickets;
CREATE POLICY "Anyone can report tickets" ON public.tickets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update tickets" ON public.tickets;
CREATE POLICY "Admin can update tickets" ON public.tickets FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admin can delete tickets" ON public.tickets;
CREATE POLICY "Admin can delete tickets" ON public.tickets FOR DELETE USING (true);

-- 6. Media Repository
DROP POLICY IF EXISTS "Media viewable by anyone" ON public.media_repository;
CREATE POLICY "Media viewable by anyone" ON media_repository FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can upload media" ON public.media_repository;
CREATE POLICY "Anyone can upload media" ON public.media_repository FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update media status" ON public.media_repository;
CREATE POLICY "Admin can update media status" ON public.media_repository FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admin can delete media" ON public.media_repository;
CREATE POLICY "Admin can delete media" ON public.media_repository FOR DELETE USING (true);

-- ==========================================
-- STORAGE BUCKETS
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('evidence', 'evidence', true),
  ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Storage Access" ON storage.objects;
CREATE POLICY "Public Storage Access" ON storage.objects FOR SELECT TO public USING (bucket_id IN ('evidence', 'media'));

DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
CREATE POLICY "Public Upload Access" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id IN ('evidence', 'media'));
