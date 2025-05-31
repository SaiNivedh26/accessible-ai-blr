-- Create custom-signs bucket in storage
insert into storage.buckets (id, name) values ('custom-signs', 'custom-signs');

-- Set up storage policy to allow authenticated users to upload their own custom signs
create policy "Users can upload their own custom signs"
  on storage.objects for insert
  with check (
    auth.role() = 'authenticated' AND
    bucket_id = 'custom-signs' AND
    (storage.foldername(name))[1] = auth.uid()
  );

-- Allow users to delete their own custom signs
create policy "Users can delete their own custom signs"
  on storage.objects for delete
  using (
    auth.role() = 'authenticated' AND
    bucket_id = 'custom-signs' AND
    (storage.foldername(name))[1] = auth.uid()
  );

-- Create custom_signs table
create table public.custom_signs (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  word text not null,
  region text not null,
  video_path text not null,
  ipfs_hash text,
  pinata_url text,
  is_active boolean default true
);

-- Set up RLS policies
alter table public.custom_signs enable row level security;

-- Users can view their own custom signs
create policy "Users can view their own custom signs"
  on public.custom_signs for select
  using (auth.uid() = user_id);

-- Users can create their own custom signs
create policy "Users can create their own custom signs"
  on public.custom_signs for insert
  with check (auth.uid() = user_id);

-- Users can update their own custom signs
create policy "Users can update their own custom signs"
  on public.custom_signs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete their own custom signs
create policy "Users can delete their own custom signs"
  on public.custom_signs for delete
  using (auth.uid() = user_id);

-- Create indexes
create index custom_signs_user_id_idx on public.custom_signs(user_id);
create index custom_signs_word_idx on public.custom_signs(word);
create index custom_signs_region_idx on public.custom_signs(region);
