-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('customer','therapist','admin')) not null default 'customer',
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists own_profile on public.profiles;
drop policy if exists update_own_profile on public.profiles;

alter table public.profiles
  add column if not exists onboarding_status text check (onboarding_status in ('incomplete','pending_review','approved')) default 'incomplete';

create policy own_profile on public.profiles
for select using (auth.uid() = id);

create policy update_own_profile on public.profiles
for update using (auth.uid() = id);

-- Addresses
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  label text,
  google_place_id text not null,
  formatted_address text not null,
  latitude double precision not null,
  longitude double precision not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Services
create table if not exists public.services (
  id serial primary key,
  name text not null,
  description text,
  base_price numeric(10,2) not null,
  duration_minutes int not null,
  is_active boolean default true
);

create table if not exists public.therapist_services (
  therapist_id uuid references public.profiles(id) on delete cascade,
  service_id int references public.services(id) on delete cascade,
  custom_price numeric(10,2),
  active boolean default true,
  primary key (therapist_id, service_id)
);

create table if not exists public.therapist_profiles (
  therapist_id uuid primary key references public.profiles(id) on delete cascade,
  bio text,
  experience_years int,
  languages text[],
  travel_radius_km int,
  latitude double precision,
  longitude double precision,
  avg_rating numeric(3,2) default 0,
  total_bookings int default 0,
  is_active boolean default true,
  payout_method text,
  payout_details text,
  portfolio_url text,
  certifications_url text,
  calendar_note text,
  profile_completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.therapist_profiles enable row level security;

create policy therapist_profile_select on public.therapist_profiles
for select using (auth.uid() = therapist_id);

create policy therapist_profile_insert on public.therapist_profiles
for insert with check (auth.uid() = therapist_id);

create policy therapist_profile_update on public.therapist_profiles
for update using (auth.uid() = therapist_id);

-- Availability
create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid references public.profiles(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_booked boolean default false,
  created_at timestamptz default now()
);

-- Bookings
do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type booking_status as enum (
      'pending','requested','accepted','rejected','cancelled','confirmed','on_the_way','in_progress','completed'
    );
  end if;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum (
      'unpaid','pending','paid','refunded'
    );
  end if;
end;
$$;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete cascade,
  therapist_id uuid references public.profiles(id),
  service_id int references public.services(id),
  address_id uuid references public.addresses(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  price numeric(10,2) not null,
  status booking_status default 'pending',
  payment_status payment_status default 'unpaid',
  stripe_payment_intent text,
  notes text,
  latitude double precision,
  longitude double precision,
  location_label text,
  location_source text,
  created_at timestamptz default now()
);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete cascade,
  therapist_id uuid references public.profiles(id) on delete cascade,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- Shop
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  stock int not null default 0,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete cascade,
  total_amount numeric(10,2) not null,
  status text check (status in ('pending','paid','shipped','completed','cancelled')) default 'pending',
  stripe_payment_intent text,
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity int not null,
  unit_price numeric(10,2) not null
);

