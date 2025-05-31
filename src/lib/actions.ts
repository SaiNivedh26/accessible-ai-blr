'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export interface CustomSignData {
  word: string
  region: string
  video_path: string
  ipfs_hash?: string
  pinata_url?: string
}

export interface CustomSign {
  id: string
  user_id: string
  word: string
  video_path: string
  region: string
  created_at: string
  ipfs_hash?: string
  pinata_url?: string
}

export async function createCustomSign(data: CustomSignData): Promise<CustomSign> {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.error('Authentication error:', userError)
    redirect('/login')
  }

  // Insert the custom sign with the authenticated user's ID
  const insertData = {
    user_id: user.id,
    word: data.word.toLowerCase().trim(),
    region: data.region.trim(),
    video_path: data.video_path,
    ipfs_hash: data.ipfs_hash,
    pinata_url: data.pinata_url
  }

  console.log('Server action inserting data:', insertData)
  console.log('Authenticated user ID:', user.id)

  const { data: customSign, error } = await supabase
    .from('custom_signs')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Database error in server action:', error)
    throw new Error(`Failed to save custom sign: ${error.message}`)
  }

  return customSign
}

export async function getUserCustomSigns(): Promise<CustomSign[]> {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.error('Authentication error:', userError)
    return []
  }

  const { data: customSigns, error } = await supabase
    .from('custom_signs')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching custom signs:', error)
    return []
  }

  return customSigns || []
}

export async function deleteCustomSign(signId: string): Promise<void> {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.error('Authentication error:', userError)
    redirect('/login')
  }

  const { error } = await supabase
    .from('custom_signs')
    .update({ is_active: false })
    .eq('id', signId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting custom sign:', error)
    throw new Error(`Failed to delete custom sign: ${error.message}`)
  }
}
