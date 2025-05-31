-- Create sign_videos bucket in storage
insert into storage.buckets (id, name) values ('sign-videos', 'sign-videos');

-- Set up storage policy to allow authenticated users to upload
create policy "Users can upload their own videos"
  on storage.objects for insert
  with check (
    auth.role() = 'authenticated' AND
    bucket_id = 'sign-videos' AND
    (storage.foldername(name))[1] = auth.uid()
  );

-- Create sign_contributions table
create table public.sign_contributions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  keyword text not null,
  video_path text not null,
  ipfs_hash text,
  pinata_url text,
  status text not null default 'pending',
  votes integer default 0,
  constraint sign_contributions_status_check 
    check (status in ('pending', 'approved', 'rejected'))
);

-- Set up RLS policies
alter table public.sign_contributions enable row level security;

create policy "Anyone can read approved contributions"
  on public.sign_contributions for select
  using (status = 'approved');

create policy "Users can create their own contributions"
  on public.sign_contributions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own pending contributions"
  on public.sign_contributions for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');

-- Create indexes
create index sign_contributions_keyword_idx on public.sign_contributions(keyword);
create index sign_contributions_user_id_idx on public.sign_contributions(user_id);
create index sign_contributions_status_idx on public.sign_contributions(status);
