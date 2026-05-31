-- Expand allowed statuses for existing Supabase projects.
-- Run this after 001_create_tables.sql if the application_status table already exists.

alter table application_status
drop constraint if exists application_status_status_check;

alter table application_status
add column if not exists status_started_at timestamp default now();

alter table application_status
add column if not exists borrow_count integer default 1;

update application_status
set status_started_at = coalesce(status_started_at, status_updated_at, created_at, now())
where status_started_at is null;

update application_status
set borrow_count = coalesce(borrow_count, 1)
where borrow_count is null;

alter table application_status
add constraint application_status_status_check
check (status in (
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
));
