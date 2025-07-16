

export type Profile = {
  id: string; // uuid, Foreign Key zu auth.users.id
  username: string;
  name: string;
  email: string;
  primary_sauna: string;
  avatar_url: string | null;
  nickname: string | null;
  phone: string | null;
  motto: string | null;
  qualifications: string[] | null;
  awards: string[] | null;
  aufguss_count: number;
  work_hours: number;
  short_notice_cancellations: number;
  is_admin: boolean;
  show_in_member_list: boolean;
  permissions: string[] | null;
  last_profile_update: string | null; // timestampz
  last_aufguss_share_timestamp: string | null; // timestampz
  created_at: string | null; // timestampz
}

// Represents the 'posts' table row, without relational data
export type PostRow = {
  id: number; // bigint
  user_id: string; // uuid
  type: 'text' | 'poll' | 'image' | 'embed';
  content: string; // Text content, poll question, or image caption
  poll_options: string[] | null; // For poll type
  votes: { [option: string]: string[] } | null; // For poll type: { "Ja": ["user_id_1"], "Nein": ["user_id_2"] }
  image_url: string | null;
  embed_url: string | null;
  created_at: string; // timestampz
  likes: string[]; // uuid[]
}

// Represents the 'comments' table row
export type CommentRow = {
    id: number;
    post_id: number;
    user_id: string;
    content: string;
    created_at: string; // timestampz
}

// Represents the 'aufguss_slots' table row
export type AufgussSlotRow = {
    id: number;
    sauna_name: string;
    start_time: string; // timestampz
    end_time: string; // timestampz
    claimed_by: string | null; // uuid of user
    aufguss_type: string | null;
}

// App-level type for Post, including joined data from relations
export type Post = PostRow & {
  comments: Comment[];
  profile?: Profile; // für Joins
}

// App-level type for Comment, including joined data
export type Comment = CommentRow & {
    profile?: Profile;
}

// App-level type for AufgussSlot, including joined data
export type AufgussSlot = AufgussSlotRow & {
    profile: Profile | null; // Joined profile of the user who claimed it
}

export type Festival = {
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
        Insert: Omit<Profile, 'created_at' | 'last_profile_update' | 'last_aufguss_share_timestamp'>;
        Update: Partial<Profile>;
      };
      posts: {
        Row: PostRow;
        Insert: Omit<PostRow, 'id' | 'created_at'>;
        Update: Partial<PostRow>;
      };
      comments: {
        Row: CommentRow;
        Insert: Omit<CommentRow, 'id' | 'created_at'>;
        Update: Partial<CommentRow>;
      };
      aufguss_slots: {
        Row: AufgussSlotRow;
        Insert: Omit<AufgussSlotRow, 'id'>;
        Update: Partial<AufgussSlotRow>;
      };
      festivals: {
        Row: Festival;
        Insert: Omit<Festival, 'id'>;
        Update: Partial<Festival>;
      };
    };
    Views: { [key: string]: never };
    Functions: { [key: string]: never };
  };
};