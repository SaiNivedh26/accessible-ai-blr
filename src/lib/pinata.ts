'use client';

import axios from 'axios';
import { saveAs } from 'file-saver';

// Define types for better TypeScript support
export interface PinataVideo {
  key: string;
  name: string;
  url: string;
  ipfsHash?: string;
}

// Mock video data for testing - in a real app, this would be fetched from Pinata
const videoDatabase: Record<string, PinataVideo> = {
  "business": { key: "business", name: "Business Sign", url: "https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco" },
  "control": { key: "control", name: "Control Sign", url: "https://ipfs.io/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG" },
  "calculator": { key: "calculator", name: "Calculator Sign", url: "https://ipfs.io/ipfs/QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx" },
  "camera": { key: "camera", name: "Camera Sign", url: "https://ipfs.io/ipfs/QmTkzDwWqPbnAh5YiV5VwcTLnGdwSNsNTn2aDxdXBFca7D" },
  "car": { key: "car", name: "Car Sign", url: "https://ipfs.io/ipfs/QmQ8w5RJUNXsCvTzA1iRo5EJ4kWcwVw5mWJ7dxPCp996Qx" },
  "compression": { key: "compression", name: "Compression Sign", url: "https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR" }
};

// Helper to get Pinata JWT from env (works for both server/client)
function getPinataJWT() {
  // Try both server and client env variable names
  return (
    process.env.NEXT_PUBLIC_PINATA_JWT ||
    process.env.PINATA_JWT ||
    ''
  );
}

export async function searchByWord(word: string): Promise<PinataVideo[]> {
  try {
    const lowerWord = word.toLowerCase();
    try {
      const response = await axios.get(
        `https://api.pinata.cloud/data/pinList?metadata[keyvalues][word]{"value":"${lowerWord}","op":"eq"}`,
        {
          headers: {
            'Authorization': `Bearer ${getPinataJWT()}`
          }
        }
      );
      
      if (response.data && response.data.rows && response.data.rows.length > 0) {
        // Transform Pinata results into our expected format
        const results = response.data.rows.map((pin: { metadata: { keyvalues?: { word?: string }, name: string }, ipfs_pin_hash: string }) => ({
          key: pin.metadata.keyvalues?.word || pin.metadata.name,
          name: pin.metadata.name,
          ipfsHash: pin.ipfs_pin_hash,
          url: `https://ipfs.io/ipfs/${pin.ipfs_pin_hash}`
        }));
        
        console.log(`✅ Found ${results.length} Pinata results matching "${word}"`);
        return results;
      }
    } catch (apiError) {
      console.error('Pinata API error:', apiError);
      // Continue with mock data if API fails
    }
    
    // Fallback to mock data
    const result = videoDatabase[lowerWord];
    if (result) {
      console.log(`✅ Found exact match for "${word}": ${result.key}`);
      return [result];
    } else {
      console.log(`❌ No exact matches found for "${word}"`);
      return [];
    }
  } catch (error) {
    console.error(`Search error:`, error);
    return [];
  }
}

export async function searchByPartialMatch(partialWord: string): Promise<PinataVideo[]> {
  try {
    const lowerPartial = partialWord.toLowerCase();
    try {
      const response = await axios.get(
        `https://api.pinata.cloud/data/pinList?metadata[name]{"value":"${lowerPartial}","op":"ilike"}`,
        {
          headers: {
            'Authorization': `Bearer ${getPinataJWT()}`
          }
        }
      );
      
      if (response.data && response.data.rows && response.data.rows.length > 0) {
        // Transform Pinata results into our expected format
        const results = response.data.rows.map((pin: { metadata: { keyvalues?: { word?: string }, name: string }, ipfs_pin_hash: string }) => ({
          key: pin.metadata.keyvalues?.word || pin.metadata.name.toLowerCase(),
          name: pin.metadata.name,
          ipfsHash: pin.ipfs_pin_hash,
          url: `https://ipfs.io/ipfs/${pin.ipfs_pin_hash}`
        }));
        
        console.log(`✅ Found ${results.length} Pinata results matching "${partialWord}"`);
        return results;
      }
    } catch (apiError) {
      console.error('Pinata API error:', apiError);
      // Continue with mock data if API fails
    }
    
    // Fallback to local results
    const results = Object.values(videoDatabase).filter(video => 
      video.key.includes(lowerPartial) || 
      video.name.toLowerCase().includes(lowerPartial)
    );
    
    if (results.length > 0) {
      console.log(`✅ Found ${results.length} videos matching "${partialWord}":`);
      results.forEach(video => {
        console.log(`  - ${video.key} (${video.name})`);
      });
      return results;
    } else {
      console.log(`❌ No matches found for "${partialWord}"`);
      return [];
    }
  } catch (error) {
    console.error(`Search error:`, error);
    return [];
  }
}

export async function getVideoByKey(key: string): Promise<PinataVideo | null> {
  try {
    const lowerKey = key.toLowerCase();
    
    // Try to find from Pinata by IPFS hash if it looks like a hash
    if (lowerKey.startsWith('qm') && lowerKey.length > 20) {
      try {
        const response = await axios.get(
          `https://api.pinata.cloud/data/pinList?hashContains=${lowerKey}`,
          {
            headers: {
              'Authorization': `Bearer ${getPinataJWT()}`
            }
          }
        );
        
        if (response.data && response.data.rows && response.data.rows.length > 0) {
          const pin = response.data.rows[0];
          return {
            key: pin.metadata.keyvalues?.word || pin.metadata.name.toLowerCase(),
            name: pin.metadata.name,
            ipfsHash: pin.ipfs_pin_hash,
            url: `https://ipfs.io/ipfs/${pin.ipfs_pin_hash}`
          };
        }
      } catch (apiError) {
        console.error('Pinata API error:', apiError);
      }
    }
    
    // Fallback to local database
    const result = Object.values(videoDatabase).find(video => video.key === lowerKey);
    
    if (result) {
      console.log(`✅ Found video with key "${key}": ${result.name}`);
      return result;
    } else {
      console.log(`❌ No video found with key "${key}"`);
      return null;
    }
  } catch (error) {
    console.error(`Error finding video by key:`, error);
    return null;
  }
}

export async function listAllVideos(): Promise<PinataVideo[]> {
  try {
    // Try to list from Pinata
    try {
      const response = await axios.get(
        'https://api.pinata.cloud/data/pinList?status=pinned&metadata[keyvalues][type]=custom-sign',
        {
          headers: {
            'Authorization': `Bearer ${getPinataJWT()}`
          }
        }
      );
      
      if (response.data && response.data.rows && response.data.rows.length > 0) {
        // Transform Pinata results into our expected format
        const results = response.data.rows.map((pin: { metadata: { keyvalues?: { word?: string }, name: string }, ipfs_pin_hash: string }) => ({
          key: pin.metadata.keyvalues?.word || pin.metadata.name.toLowerCase(),
          name: pin.metadata.name,
          ipfsHash: pin.ipfs_pin_hash,
          url: `https://ipfs.io/ipfs/${pin.ipfs_pin_hash}`
        }));
        
        console.log(`✅ Found ${results.length} videos from Pinata`);
        return results;
      }
    } catch (apiError) {
      console.error('Pinata API error:', apiError);
    }
    
    // Fallback to mock data
    const videos = Object.values(videoDatabase);
    console.log("Available videos from mock database:");
    videos.forEach(video => {
      console.log(`  - ${video.key}: ${video.name}`);
    });
    return videos;
  } catch (error) {
    console.error(`Error listing videos:`, error);
    return [];
  }
}

export async function downloadVideo(video: PinataVideo): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    // In real implementation, this would download from IPFS/Pinata
    console.log(`📥 Downloading "${video.name}" (${video.key})...`);
    
    // Actual implementation with axios and file-saver
    const response = await axios.get(video.url, { responseType: 'blob' });
    saveAs(response.data, `${video.key}.mp4`);
    
    console.log(`✅ Download complete: ${video.key}.mp4`);
    return { success: true, path: `${video.key}.mp4` };
  } catch (error: unknown) {
    console.error(`❌ Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function downloadMultipleVideos(videos: PinataVideo[]): Promise<Array<{ success: boolean; path?: string; error?: string; key: string }>> {
  console.log(`📥 Downloading ${videos.length} videos...`);
  
  const results = [];
  for (const video of videos) {
    const result = await downloadVideo(video);
    results.push({ ...result, key: video.key });
  }
  
  const successful = results.filter(r => r.success).length;
  console.log(`🏁 Download complete: ${successful}/${videos.length} successful`);
  
  return results;
}

export async function uploadToPinata(file: File | Blob, metadata: Record<string, unknown>): Promise<{ success: boolean; ipfsHash?: string; url?: string; error?: string }> {
  try {
    console.log(`📤 Uploading "${metadata.name}" to Pinata...`);
    // Create form data for Pinata API
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({
      name: metadata.name,
      keyvalues: metadata
    }));
    // Make actual Pinata API call
    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS', 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${getPinataJWT()}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      if (response.data && (response.data.IpfsHash || response.data.IpfsHash === '')) {
        const hash = response.data.IpfsHash;
        const url = `https://ipfs.io/ipfs/${hash}`;
        console.log(`✅ Upload complete! IPFS Hash: ${hash}`);
        return { success: true, ipfsHash: hash, url };
      } else {
        throw new Error('Invalid response from Pinata');
      }
    } catch (apiError: unknown) {
      console.error('Pinata API error:', apiError);
      // Fallback to mock for development/testing
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Using mock IPFS hash for development');
        const mockIpfsHash = "QmXs5YEUXxynWmdFnFLVMPA4bZQZuJ1RA8MJU5JSYghpet";
        return { 
          success: true, 
          ipfsHash: mockIpfsHash, 
          url: `https://ipfs.io/ipfs/${mockIpfsHash}`
        };
      }
      throw apiError;
    }
  } catch (error: unknown) {
    console.error(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Helper to always get a valid video URL for rendering
export function getVideoUrl(sign: { pinata_url?: string; ipfs_hash?: string; video_path?: string }): string {
  if (sign.pinata_url) return sign.pinata_url;
  if (sign.ipfs_hash) return `https://ipfs.io/ipfs/${sign.ipfs_hash}`;
  if (sign.video_path && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/custom-signs/${sign.video_path}`;
  }
  return '';
}

export async function replaceVideo(key: string, file: File | Blob): Promise<{ success: boolean; ipfsHash?: string; url?: string; error?: string }> {
  try {
    console.log(`🔄 Replacing video "${key}"`);
    // Create metadata for the replacement
    const metadata = {
      word: key,
      updatedAt: new Date().toISOString(),
      type: 'custom-sign'
    };
    // Perform the upload as a new file (Pinata doesn't have direct replacement)
    return await uploadToPinata(file, metadata);
  } catch (error: unknown) {
    console.error(`❌ Replacement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Additional function for the customization page
export async function searchAndUploadSign(word: string, region: string, blob: Blob): Promise<{ success: boolean; ipfsHash?: string; url?: string; error?: string }> {
  try {
    console.log(`🔍 Searching for existing sign: "${word}" (${region})`);
    
    // First check if the sign already exists
    const existingSign = await searchByWord(word);
    
    // Create metadata
    const metadata = {
      word: word.toLowerCase(),
      region: region,
      createdAt: new Date().toISOString(),
      type: 'custom-sign'
    };
    
    // Convert blob to file
    const file = new File([blob], `${word}-${region}.webm`, { type: blob.type });
    
    if (existingSign.length > 0) {
      console.log(`⚠️ Sign already exists. Replacing...`);
      // Call replaceVideo directly
      const result = await replaceVideo(existingSign[0].key, file);
      return result;
    } else {
      console.log(`🆕 New sign. Uploading to Pinata...`);
      const result = await uploadToPinata(file, metadata);
      return result;
    }
  } catch (error: unknown) {
    console.error(`❌ Error in searchAndUploadSign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
