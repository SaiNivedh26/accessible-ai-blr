-- Create a table for public profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  full_name text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint username_length check (char_length(username) >= 3),
  constraint username_format check (username ~ '^[a-zA-Z0-9_]+$')
);

-- Create a table for user conversion history
create table if not exists public.conversions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  input_text text not null,
  output_video_url text,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

-- Create a table for saved translations
create table if not exists public.saved_translations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  conversion_id uuid references public.conversions on delete cascade not null,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.conversions enable row level security;
alter table public.saved_translations enable row level security;

-- Create security policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can view their own conversions." on public.conversions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own conversions." on public.conversions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own conversions." on public.conversions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own conversions." on public.conversions
  for delete using (auth.uid() = user_id);

create policy "Users can view their own saved translations." on public.saved_translations
  for select using (auth.uid() = user_id);

create policy "Users can insert their own saved translations." on public.saved_translations
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own saved translations." on public.saved_translations
  for update using (auth.uid() = user_id);

create policy "Users can delete their own saved translations." on public.saved_translations
  for delete using (auth.uid() = user_id);

-- Function to handle user profile creation on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, created_at, updated_at)
  values (new.id, new.raw_user_meta_data->>'full_name', now(), now());
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
