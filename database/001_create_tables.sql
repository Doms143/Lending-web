-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Table: application_status
create table application_status (
  id uuid default uuid_generate_v4() primary key,
  app_id text unique,
  status text default 'pending' check (status in (
    'pending',
    'under_review',
    'approved',
    'rejected',
    'released',
    'active',
    'partially_paid',
    'paid',
    'overdue',
    'defaulted',
    'cancelled'
  )),
  rejection_reason text,
  admin_notes text,
  borrow_count integer default 1,
  status_started_at timestamp default now(),
  status_updated_at timestamp default now(),
  created_at timestamp default now()
);

-- Table: audit log
-- Uses Supabase Auth user IDs (text, no FK constraint)
create table audit_log (
  id uuid default uuid_generate_v4() primary key,
  user_id text,
  action text,
  application_id text,
  details jsonb,
  created_at timestamp default now()
);

-- Index for faster lookups
create index idx_application_status_app_id on application_status(app_id);
