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

// Represents the 'posts' table row, without relational data
export interface PostRow {
  id: number; // bigint
  user_id: string; // uuid
  type: 'text' | 'poll' | 'image' | 'embed';
  content: string; // Text content, poll question, or image caption
  poll_options?: string[]; // For poll type
  votes?: { [option: string]: string[] }; // For poll type: { "Ja": ["user_id_1"], "Nein": ["user_id_2"] }
  image_url?: string;
  embed_url?: string;
  created_at: string; // timestampz
  likes: string[]; // uuid[]
}

// Represents the 'comments' table row
export interface CommentRow {
    id: number;
    post_id: number;
    user_id: string;
    content: string;
    created_at: string; // timestampz
}

// Represents the 'aufguss_slots' table row
export interface AufgussSlotRow {
    id: number;
    sauna_name: string;
    start_time: string; // timestampz
    end_time: string; // timestampz
    claimed_by: string | null; // uuid of user
    aufguss_type: string | null;
}

// App-level type for Post, including joined data from relations
export interface Post extends PostRow {
  comments: Comment[];
  profile?: Profile; // für Joins
}

// App-level type for Comment, including joined data
export interface Comment extends CommentRow {
    profile?: Profile;
}

// App-level type for AufgussSlot, including joined data
export interface AufgussSlot extends AufgussSlotRow {
    profile: Profile | null; // Joined profile of the user who claimed it
}

export interface Festival {
    id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
}

// Supabase database schema definition
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      };
      posts: {
        Row: PostRow;
        Insert: Partial<PostRow>;
        Update: Partial<PostRow>;
      };
      comments: {
        Row: CommentRow;
        Insert: Partial<CommentRow>;
        Update: Partial<CommentRow>;
      };
      aufguss_slots: {
        Row: AufgussSlotRow;
        Insert: Partial<AufgussSlotRow>;
        Update: Partial<AufgussSlotRow>;
      };
      festivals: {
        Row: Festival;
        Insert: Partial<Festival>;
        Update: Partial<Festival>;
      };
    };
    Views: { [key: string]: never };
    Functions: { [key: string]: never };
  };
};
