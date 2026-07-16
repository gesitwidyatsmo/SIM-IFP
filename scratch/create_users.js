const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createUsers() {
  const users = [
    { email: 'admin@sim-ifp.com', password: 'password123' },
    { email: 'guru@sim-ifp.com', password: 'password123' },
    { email: 'tutor@sim-ifp.com', password: 'password123' },
    { email: 'kepsek@sim-ifp.com', password: 'password123' }
  ];

  for (const user of users) {
    console.log(`Mencoba mendaftarkan: ${user.email}...`);
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
    });
    
    if (error) {
      console.error(`Gagal mendaftarkan ${user.email}:`, error.message);
    } else {
      console.log(`Berhasil mendaftarkan ${user.email}. Silakan cek apakah perlu konfirmasi email.`);
    }
  }
}

createUsers();
