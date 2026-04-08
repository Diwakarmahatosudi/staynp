-- StayNP Database Schema for Supabase
-- Run this in the Supabase SQL Editor to set up your database

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  email text,
  avatar_url text,
  is_host boolean default false,
  is_verified boolean default false,
  kyc_document_url text,
  kyc_status text default 'none' check (kyc_status in ('none', 'pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'StayNP User'),
    new.email,
    new.phone
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- PROPERTIES
-- ============================================
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  property_type text not null check (property_type in (
    'homestay', 'lodge', 'guest-house', 'boutique-hotel', 'heritage-stay', 'mountain-retreat'
  )),
  price_per_night integer not null check (price_per_night > 0),
  location_lat double precision,
  location_lng double precision,
  address text,
  district text not null,
  region text,
  beds integer default 1,
  bedrooms integer default 1,
  bathrooms integer default 1,
  max_guests integer default 2,
  amenities text[] default '{}',
  main_image_url text,
  images text[] default '{}',
  host_id uuid references public.profiles(id) on delete cascade not null,
  is_active boolean default true,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_properties_host on public.properties(host_id);
create index idx_properties_district on public.properties(district);
create index idx_properties_type on public.properties(property_type);
create index idx_properties_active on public.properties(is_active) where is_active = true;

-- ============================================
-- BOOKINGS
-- ============================================
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  guest_id uuid references public.profiles(id) on delete cascade not null,
  check_in date not null,
  check_out date not null,
  guests_count integer default 1,
  total_price integer not null check (total_price > 0),
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_method text check (payment_method in ('esewa', 'khalti', 'card', 'bank_transfer')),
  payment_id text,
  guest_phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint check_dates check (check_out > check_in)
);

create index idx_bookings_property on public.bookings(property_id);
create index idx_bookings_guest on public.bookings(guest_id);
create index idx_bookings_dates on public.bookings(property_id, check_in, check_out);

-- Prevent double bookings via a function
create or replace function public.check_booking_conflict()
returns trigger as $$
begin
  if exists (
    select 1 from public.bookings
    where property_id = new.property_id
      and id != coalesce(new.id, uuid_generate_v4())
      and status not in ('cancelled')
      and check_in < new.check_out
      and check_out > new.check_in
  ) then
    raise exception 'Booking conflict: dates overlap with an existing booking';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger check_booking_before_insert
  before insert or update on public.bookings
  for each row execute procedure public.check_booking_conflict();

-- ============================================
-- REVIEWS
-- ============================================
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  guest_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  unique(property_id, guest_id)
);

create index idx_reviews_property on public.reviews(property_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Properties
alter table public.properties enable row level security;

create policy "Active properties are viewable by everyone"
  on public.properties for select
  using (is_active = true);

create policy "Hosts can insert own properties"
  on public.properties for insert
  with check (auth.uid() = host_id);

create policy "Hosts can update own properties"
  on public.properties for update
  using (auth.uid() = host_id);

create policy "Hosts can delete own properties"
  on public.properties for delete
  using (auth.uid() = host_id);

-- Bookings
alter table public.bookings enable row level security;

create policy "Users can view own bookings"
  on public.bookings for select
  using (auth.uid() = guest_id or auth.uid() in (
    select host_id from public.properties where id = property_id
  ));

create policy "Authenticated users can create bookings"
  on public.bookings for insert
  with check (auth.uid() = guest_id);

create policy "Booking parties can update bookings"
  on public.bookings for update
  using (auth.uid() = guest_id or auth.uid() in (
    select host_id from public.properties where id = property_id
  ));

-- Reviews
alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

create policy "Guests can create reviews"
  on public.reviews for insert
  with check (auth.uid() = guest_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run these in the Supabase dashboard or via API:
--
-- 1. Create 'property-images' bucket (public)
-- 2. Create 'avatars' bucket (public)
-- 3. Create 'kyc-documents' bucket (private)
--
-- insert into storage.buckets (id, name, public)
-- values
--   ('property-images', 'property-images', true),
--   ('avatars', 'avatars', true),
--   ('kyc-documents', 'kyc-documents', false);
