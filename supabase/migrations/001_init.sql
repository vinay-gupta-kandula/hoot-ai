-- Enable UUID extension (safe to re-run)
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. main_mentors
-- ==========================================
create table main_mentors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text unique,
  password_hash text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 2. mentors (linked to main_mentors)
-- ==========================================
create table mentors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text unique,
  password_hash text,
  pool_no integer,
  main_mentor_id uuid references main_mentors(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 3. students (linked to mentors + branches)
-- ==========================================
create table students (
  id uuid default gen_random_uuid() primary key,
  roll_no text not null unique,
  name text not null,
  email text unique,
  password_hash text,
  gender text,
  branch text,
  college text,
  technology text,
  mentor_id uuid references mentors(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 4. assessments (raw JSON rows normalized)
-- ==========================================
create table assessments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid not null references students(id) on delete cascade,
  mentor_id uuid references mentors(id) on delete set null,
  module_name text,
  course_name text,
  accuracy numeric,
  total_duration integer,
  attempt_count integer,
  assessment_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, module_name, assessment_date)
);

-- Optional indexes for faster lookups
create index idx_students_roll_no on students(roll_no);
create index idx_students_mentor_id on students(mentor_id);
create index idx_assessments_student_id on assessments(student_id);
create index idx_assessments_date on assessments(assessment_date);