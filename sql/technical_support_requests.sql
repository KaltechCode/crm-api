create table if not exists public.technical_support_requests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  email text not null,
  phone_number text not null,
  agent_code text not null,
  subject text not null,
  description text not null,
  support_email_sent boolean not null default false,
  submitter_email_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists technical_support_requests_created_at_idx
  on public.technical_support_requests (created_at desc);

alter table public.technical_support_requests enable row level security;
