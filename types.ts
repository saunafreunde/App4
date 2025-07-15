export interface Profile {
  id: string; // uuid, Foreign Key zu auth.users.id
  username: string;
  name: string;
  email: string;
  primary_sauna: string;
  avatar_url?: string;
  nickname?: string;
  phone?: string;
  motto?: string;
  qualifications?: string[];
  awards?: string[];
  aufguss_count: number;
  work_hours: number;
  short_notice_cancellations: number;
  is_admin: boolean;
  show_in_member_list: boolean;
  permissions?: string[];
  last_profile_update?: string; // timestampz
  last_aufguss_share_timestamp?: string; // timestampz
  created_at?: string; // timestampz
}

export interface Post {
  id: number; // bigint
  user_id: string; // uuid
  type: 'text' | 'poll' | 'image' | 'embed';
  content: string;
  poll_data?: any; // jsonb
  image_url?: string;
  embed_url?: string;
  created_at: string; // timestampz
  likes: string[]; // uuid[]
  profile?: Profile; // für Joins
}

export interface Comment {
    id: number;
    post_id: number;
    user_id: string;
    content: string;
    created_at: string; // timestampz
}

export interface Aufguss {
    id: number;
    // ... weitere Felder
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      };
      posts: {
        Row: Post;
        Insert: Partial<Post>;
        Update: Partial<Post>;
      };
    };
    Views: { [key: string]: never };
    Functions: { [key: string]: never };
  };
};