require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createTestUsers() {
  const testUsers = [
    { email: 'head.mentor@institution.edu', password: 'password123' },
  ];

  // Get one random student
  const { data: students } = await supabase.from('students').select('email').limit(1);
  if (students && students.length > 0) {
    testUsers.push({ email: students[0].email, password: 'password123' });
  }

  // Get one random mentor
  const { data: mentors } = await supabase.from('mentors').select('email').limit(1);
  if (mentors && mentors.length > 0) {
    testUsers.push({ email: mentors[0].email, password: 'password123' });
  }

  console.log('Creating test users...');
  for (const user of testUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true
    });
    if (error) {
      console.log(`Failed to create ${user.email}: ${error.message}`);
    } else {
      console.log(`✅ Created user: ${user.email} (Password: ${user.password})`);
    }
  }
}

createTestUsers();
