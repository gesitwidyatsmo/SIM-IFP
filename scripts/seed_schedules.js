const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcjrqsreexlzjpgbgkhj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjanJxc3JlZXhsempwZ2Jna2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxODkwNDUsImV4cCI6MjA5OTc2NTA0NX0.GTdROfgY3VaMzOljEumhqXeMTVS9oMh5cINy5Gp337E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Parsed weekly templates
const parsedData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'scratch', 'parsed_schedule.json'), 'utf8'));

const assets = {
  'IFP-LAB-PUTRA': '394831f1-ce17-4801-b99b-9540da8097ab',
  'IFP-LAB-PUTRI': '230b4c8e-b9ff-4709-8852-f04496370a43'
};

const dayOffsets = {
  'SENIN': 0,
  'SELASA': 1,
  'RABU': 2,
  'KAMIS': 3,
  'SABTU': 5,
  'AHAD': 6
};

function formatTime(raw) {
  const matches = [...raw.matchAll(/(\d{1,2})[.:](\d{2})/g)];
  if (matches.length >= 2) {
    const h1 = String(parseInt(matches[0][1], 10)).padStart(2, '0');
    const m1 = matches[0][2];
    const h2 = String(parseInt(matches[1][1], 10)).padStart(2, '0');
    const m2 = matches[1][2];
    return [`${h1}:${m1}`, `${h2}:${m2}`];
  }
  return [null, null];
}

function getTeacher(cls) {
  const c = cls.toUpperCase().replace(/\s+/g, '').replace(/\./g, '');
  if (c.startsWith('XI') || c.startsWith('XII')) return 'Gesit Widi Atmoko, S.Kom';
  if (c.startsWith('VIII')) return 'Ikrom Ihlasul Muslimin, S.Pd';
  if (c === 'VIIE' || c === 'VIIF') return 'Puput Triana, S.Pd';
  if (['VIIA', 'VIIB', 'VIIC', 'VIID', 'IXG', 'IXH'].includes(c) || c.startsWith('X')) return 'Rohmat Santoso, S.Kom';
  if (['IXA', 'IXB', 'IXC', 'IXD', 'IXE', 'IXF'].includes(c)) return 'Rachmadi Alwi, S.Kom., Gr';
  return 'Guru Informatika';
}

function generateSchedules(startYear = 2026, startMonth = 7, endYear = 2027, endMonth = 6) {
  const records = [];
  let curYear = startYear;
  let curMonth = startMonth;

  while (curYear < endYear || (curYear === endYear && curMonth <= endMonth)) {
    // 1st of the month
    const d1 = new Date(Date.UTC(curYear, curMonth - 1, 1));
    // Weekday: 0=Sun, 1=Mon, ..., 6=Sat
    // Convert to Monday=0: (day + 6) % 7
    const dayOfWeek = (d1.getUTCDay() + 6) % 7;
    // Monday of Week 1
    const mondayW1 = new Date(d1);
    mondayW1.setUTCDate(d1.getUTCDate() - dayOfWeek);

    const weekKeys = ['MINGGU 1', 'MINGGU 2', 'MINGGU 3', 'MINGGU 4'];
    weekKeys.forEach((weekKey, wIdx) => {
      const mondayW = new Date(mondayW1);
      mondayW.setUTCDate(mondayW1.getUTCDate() + (wIdx * 7));

      const entries = parsedData[weekKey] || [];
      entries.forEach(entry => {
        const dayOffset = dayOffsets[entry.day];
        if (dayOffset === undefined) return;

        const schedDate = new Date(mondayW);
        schedDate.setUTCDate(mondayW.getUTCDate() + dayOffset);

        const y = schedDate.getUTCFullYear();
        const m = String(schedDate.getUTCMonth() + 1).padStart(2, '0');
        const d = String(schedDate.getUTCDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        const [startT, endT] = formatTime(entry.time_raw);
        if (!startT || !endT) return;

        const assetCode = entry.labor.toUpperCase().includes('PUTRA') ? 'IFP-LAB-PUTRA' : 'IFP-LAB-PUTRI';
        const assetId = assets[assetCode];
        const teacher = getTeacher(entry.class_name);

        // WIB is UTC+7
        const startTimeTz = `${dateStr}T${startT}:00+07:00`;
        const endTimeTz = `${dateStr}T${endT}:00+07:00`;

        records.push({
          ifp_asset_id: assetId,
          user_id: null,
          title: 'Praktek Informatika',
          start_time: startTimeTz,
          end_time: endTimeTz,
          category: 'Pembelajaran',
          subject: 'Informatika',
          class_name: entry.class_name.trim(),
          type: 'REGULER_INDUK',
          status: 'APPROVED',
          notes: `Guru: ${teacher} | ${weekKey} - ${entry.day}`
        });
      });
    });

    if (curMonth === 12) {
      curMonth = 1;
      curYear += 1;
    } else {
      curMonth += 1;
    }
  }

  return records;
}

async function run() {
  console.log('🚀 Menghasilkan data jadwal (Juli 2026 s.d Juni 2027)...');
  const schedules = generateSchedules(2026, 7, 2027, 6);
  console.log(`📊 Total jadwal dihasilkan: ${schedules.length} baris.`);

  // Clear existing default/test schedules if any
  console.log('🧹 Membersihkan jadwal reguler lama...');
  const { error: delError } = await supabase
    .from('schedules')
    .delete()
    .eq('title', 'Praktek Informatika');
  
  if (delError) {
    console.warn('Catatan hapus jadwal lama:', delError.message);
  }

  // Batch insert
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < schedules.length; i += batchSize) {
    const chunk = schedules.slice(i, i + batchSize);
    const { error } = await supabase
      .from('schedules')
      .insert(chunk);

    if (error) {
      console.error(`❌ Gagal insert batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      process.exit(1);
    }
    inserted += chunk.length;
    console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} tersimpan (${inserted}/${schedules.length} rows)`);
  }

  // Count verification
  const { count, error: countErr } = await supabase
    .from('schedules')
    .select('*', { count: 'exact', head: true });

  console.log(`\n🎉 SUKSES! Total data jadwal aktif di database: ${count} baris.`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
