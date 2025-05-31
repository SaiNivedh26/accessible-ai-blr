-- Script to create the custom-signs bucket and set up RLS policies
-- Run this in your Supabase SQL editor

-- Create the custom-signs bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('custom-signs', 'custom-signs', true) 
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for custom-signs bucket

-- Allow authenticated users to upload to custom-signs
CREATE POLICY "Authenticated users can upload to custom-signs"
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'custom-signs');

-- Allow public read access to custom-signs
CREATE POLICY "Public read access to custom-signs"
ON storage.objects 
FOR SELECT
USING (bucket_id = 'custom-signs');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own custom-signs"
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'custom-signs' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own custom-signs"
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'custom-signs' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
