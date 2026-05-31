-- Table: applications
-- Stores synced loan application data from Google Sheets
create table if not exists applications (
  id text primary key,
  email text,
  full_name text,
  date_of_birth text,
  age integer,
  phone_number text,
  source_of_income text,
  address jsonb,
  amount numeric(12,2),
  duration text,
  interest numeric(12,2),
  reason_for_borrowing text,
  facebook_link text,
  instagram_link text,
  contact_person_1 jsonb,
  contact_person_2 jsonb,
  images jsonb,
  submitted_at timestamp,
  row_index integer,
  raw_data jsonb,
  synced_at timestamp
);

-- Indexes for common queries
create index if not exists idx_applications_email on applications(email);
create index if not exists idx_applications_submitted_at on applications(submitted_at desc);
