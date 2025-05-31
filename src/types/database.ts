export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  updated_at: string | null;
  created_at: string;
}

export type Conversion = {
  id: string;
  user_id: string;
  input_text: string;
  output_video_url: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string | null;
}

export type SavedTranslation = {
  id: string;
  user_id: string;
  conversion_id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      conversions: {
        Row: Conversion;
        Insert: Omit<Conversion, 'id' | 'created_at'>;
        Update: Partial<Omit<Conversion, 'id' | 'user_id' | 'created_at'>>;
      };
      saved_translations: {
        Row: SavedTranslation;
        Insert: Omit<SavedTranslation, 'id' | 'created_at'>;
        Update: Partial<Omit<SavedTranslation, 'id' | 'user_id' | 'created_at'>>;
      };
    };
  };
};
