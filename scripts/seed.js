// seed.js
// Install: npm install axios @supabase/supabase-js dotenv
// Run:     node seed.js

require('dotenv').config({ path: '.env.local' });
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// ------------------------------------------------------------------
// CONFIG
// ------------------------------------------------------------------
const API_URL = process.env.API_URL || 'https://your-api-endpoint.com/data';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const toEmail = (raw, domain) => {
  const slug = raw
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');
  return `${slug}@${domain}`;
};

// "01-12-2025" → "2025-12-01"
const parseDate = (str) => {
  const [d, m, y] = str.split('-');
  return `${y}-${m}-${d}`;
};

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
async function seed() {
  console.log('⏳ Fetching API data...');
  const { data: rows } = await axios.get(API_URL);
  console.log(`✅ Fetched ${rows.length} rows`);

  // --------------------------------------------------------------
  // 1. main_mentors (default head mentor — JSON has no main_mentor field)
  // --------------------------------------------------------------
  console.log('⏳ Upserting main_mentors...');
  const { data: mainMentors, error: mmErr } = await supabase
    .from('main_mentors')
    .upsert(
      [{ name: 'Head Mentor', email: 'head.mentor@institution.edu' }],
      { onConflict: 'email' }
    )
    .select();
  if (mmErr) throw mmErr;
  const mainMentorId = mainMentors[0].id;

  // --------------------------------------------------------------
  // 2. mentors  (unique by pool_no + pool_mentor)
  // --------------------------------------------------------------
  console.log('⏳ Upserting mentors...');
  const mentorMap = new Map(); // key: "pool_no|name" -> uuid

  const mentorSet = new Map();
  for (const r of rows) {
    const key = `${r.pool_no}|${r.pool_mentor}`;
    if (!mentorSet.has(key)) {
      mentorSet.set(key, {
        name: r.pool_mentor,
        email: toEmail(`${r.pool_mentor}_${r.pool_no}`, 'mentor.edu'),
        pool_no: r.pool_no,
        main_mentor_id: mainMentorId,
      });
    }
  }
  const uniqueMentors = Array.from(mentorSet.values());
  const CHUNK_SIZE = 5000;

  for (let i = 0; i < uniqueMentors.length; i += CHUNK_SIZE) {
    const chunk = uniqueMentors.slice(i, i + CHUNK_SIZE);
    const { data: mentors, error: mErr } = await supabase
      .from('mentors')
      .upsert(chunk, { onConflict: 'email' })
      .select();
    if (mErr) throw mErr;
    mentors.forEach((m) => mentorMap.set(`${m.pool_no}|${m.name}`, m.id));
  }

  // --------------------------------------------------------------
  // 3. students (unique by roll_no)
  // --------------------------------------------------------------
  console.log('⏳ Upserting students...');
  const studentMap = new Map(); // key: roll_no -> uuid

  const studentSet = new Map();
  for (const r of rows) {
    if (!studentSet.has(r.roll_no)) {
      studentSet.set(r.roll_no, {
        roll_no: r.roll_no,
        name: r.name,
        email: toEmail(r.roll_no, 'student.edu'),
        gender: r.gender,
        branch: r.branch,
        college: r.college,
        technology: r.technology,
        mentor_id: mentorMap.get(`${r.pool_no}|${r.pool_mentor}`),
      });
    }
  }
  const uniqueStudents = Array.from(studentSet.values());

  for (let i = 0; i < uniqueStudents.length; i += CHUNK_SIZE) {
    const chunk = uniqueStudents.slice(i, i + CHUNK_SIZE);
    console.log(`⏳ Upserting students chunk ${Math.floor(i / CHUNK_SIZE) + 1}...`);
    const { data: students, error: sErr } = await supabase
      .from('students')
      .upsert(chunk, { onConflict: 'roll_no' })
      .select();
    if (sErr) throw sErr;
    students.forEach((s) => studentMap.set(s.roll_no, s.id));
  }

  // --------------------------------------------------------------
  // 4. assessments (all JSON rows)
  // --------------------------------------------------------------
  console.log('⏳ Upserting assessments...');
  const assessmentMap = new Map();
  for (const r of rows) {
    const student_id = studentMap.get(r.roll_no);
    const date = parseDate(r.date);
    const key = `${student_id}|${r.module_name}|${date}`;
    assessmentMap.set(key, {
      student_id,
      mentor_id: mentorMap.get(`${r.pool_no}|${r.pool_mentor}`),
      module_name: r.module_name,
      course_name: r.course_name,
      accuracy: r.accuracy,
      total_duration: r.total_duration,
      attempt_count: r.attempt_count,
      assessment_date: date,
    });
  }
  const assessments = Array.from(assessmentMap.values());

  for (let i = 0; i < assessments.length; i += CHUNK_SIZE) {
    const chunk = assessments.slice(i, i + CHUNK_SIZE);
    console.log(`⏳ Upserting assessments chunk ${Math.floor(i / CHUNK_SIZE) + 1}...`);
    const { error: aErr } = await supabase
      .from('assessments')
      .upsert(chunk, {
        onConflict: 'student_id,module_name,assessment_date',
        ignoreDuplicates: false, // update on conflict
      });
    if (aErr) throw aErr;
  }

  console.log('🎉 Seed complete!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});