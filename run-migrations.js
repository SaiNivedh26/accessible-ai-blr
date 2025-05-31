const { createClient } = require('@supabase/supabase-js')

// Load environment variables manually from .env.local
const supabaseUrl = 'https://jatcprjfqomrhvghjwtl.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdGNwcmpmcW9tcmh2Z2hqd3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODY4MjA2MiwiZXhwIjoyMDY0MjU4MDYyfQ.TIZYtZOOa1V1Xsmge3dPdm5EzQNGdYVDxvbfm8PlTsY'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createBucket() {
  try {
    console.log('🪣 Creating custom-signs storage bucket...')
    
    const { data, error } = await supabase.storage.createBucket('custom-signs', {
      public: false,
      allowedMimeTypes: ['video/webm', 'video/mp4'],
      fileSizeLimit: 52428800 // 50MB
    })
    
    if (error && !error.message.includes('already exists')) {
      console.error('❌ Failed to create bucket:', error.message)
      return false
    } else if (error && error.message.includes('already exists')) {
      console.log('✅ Bucket already exists')
    } else {
      console.log('✅ Bucket created successfully')
    }
    return true
  } catch (err) {
    console.error('❌ Bucket creation error:', err.message)
    return false
  }
}

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test if custom_signs table exists by trying a simple query
    const { data, error, count } = await supabase
      .from('custom_signs')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log('❌ Table does not exist:', error.message)
      return false
    } else {
      console.log('✅ Table exists and is accessible')
      return true
    }
  } catch (err) {
    console.error('❌ Database test error:', err.message)
    return false
  }
}

async function runMigrations() {
  try {
    console.log('🚀 Running database setup...')
    
    // Test if table exists
    const tableExists = await testDatabase()
    
    // Create bucket
    await createBucket()
    
    if (!tableExists) {
      console.log('⚠️ The custom_signs table needs to be created manually.')
      console.log('📋 Please run this SQL in your Supabase dashboard:')
      console.log(`
-- Create custom_signs table
CREATE TABLE IF NOT EXISTS public.custom_signs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  word text NOT NULL,
  region text NOT NULL,
  video_path text NOT NULL,
  ipfs_hash text,
  pinata_url text,
  is_active boolean DEFAULT true
);

-- Set up RLS policies
ALTER TABLE public.custom_signs ENABLE row level security;

-- Users can view their own custom signs
CREATE POLICY "Users can view their own custom signs"
  ON public.custom_signs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own custom signs
CREATE POLICY "Users can create their own custom signs"
  ON public.custom_signs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own custom signs
CREATE POLICY "Users can update their own custom signs"
  ON public.custom_signs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own custom signs
CREATE POLICY "Users can delete their own custom signs"
  ON public.custom_signs FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS custom_signs_user_id_idx ON public.custom_signs(user_id);
CREATE INDEX IF NOT EXISTS custom_signs_word_idx ON public.custom_signs(word);
CREATE INDEX IF NOT EXISTS custom_signs_region_idx ON public.custom_signs(region);
      `)
    }
    
    console.log('🎉 Setup completed!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

runMigrations()
