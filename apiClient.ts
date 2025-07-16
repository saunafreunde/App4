import { createClient, Session, User } from '@supabase/supabase-js';
import { Profile, Post, Database, AufgussSlot, Festival, Comment, PostRow, AufgussSlotRow } from './types.ts';

// WICHTIG: Diese Werte werden von den Umgebungsvariablen (z.B. in Netlify) geladen.
// Sie dürfen NICHT hartkodiert werden!
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;


if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Supabase URL und/oder Key sind nicht konfiguriert. Stellen Sie sicher, dass VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY in Ihrer Umgebung (z.B. .env Datei) gesetzt sind.");
}

// Die '!' sagen TypeScript, dass wir sicher sind, dass diese Werte zur Laufzeit vorhanden sein werden.
// Wenn sie fehlen, wird die App wie erwartet einen Fehler werfen.
const supabase = createClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!);

const apiClient = {
  // === Auth ===
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  },

  async login(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async register(email, password) {
    return supabase.auth.signUp({ email, password });
  },

  async logout() {
    return supabase.auth.signOut();
  },

  // === Profiles ===
  async getUserProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching profile:', error);
    }
    return data;
  },
  
  async createProfile(profileData: Database['public']['Tables']['profiles']['Insert']) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();
    if (error) {
        console.error("Error creating profile:", error);
    }
    return { data, error };
  },

    // === Posts & Social ===
  async getPosts(): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profile:profiles(*), comments(*, profile:profiles(*))')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
    return data as Post[];
  },

  async addPost(postData: Database['public']['Tables']['posts']['Insert'], imageFile?: File): Promise<{ data: Post | null; error: any }> {
    let imageUrl: string | null = null;

    if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${postData.user_id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
            .from('post-images')
            .upload(filePath, imageFile);

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            return { data: null, error: uploadError };
        }
        
        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
    }
    
    const insertData = { ...postData, image_url: imageUrl };

    const { data, error } = await supabase
        .from('posts')
        .insert(insertData)
        .select('*, profile:profiles(*), comments(*, profile:profiles(*))')
        .single();
        
    return { data: data as Post, error };
  },

  async toggleLikePost(postId: number, userId: string) {
      // simplified logic: get current likes, add/remove user, update
      const { data: post, error: fetchError } = await supabase.from('posts').select('likes').eq('id', postId).single();
      if (fetchError || !post) return { error: fetchError };

      const likes = post.likes || [];
      const newLikes = likes.includes(userId) ? likes.filter(id => id !== userId) : [...likes, userId];

      return supabase.from('posts').update({ likes: newLikes }).eq('id', postId);
  },
  
  async addComment(commentData: Database['public']['Tables']['comments']['Insert']): Promise<{data: Comment | null, error: any}> {
      const { data, error } = await supabase.from('comments').insert(commentData).select('*, profile:profiles(*)').single();
      return { data: data as Comment, error };
  },

  // === Members ===
  async getMembers(): Promise<Profile[]> {
      const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('show_in_member_list', true)
          .order('name', { ascending: true });
      if (error) {
          console.error('Error fetching members:', error);
          return [];
      }
      return data;
  },
  
  // === Aufguss Planner ===
  async getAufgussPlanForRange(start: string, end: string): Promise<AufgussSlot[]> {
      const { data, error } = await supabase
        .from('aufguss_slots')
        .select('*, profile:profiles(id, name, username, avatar_url)')
        .gte('start_time', start)
        .lte('start_time', end)
        .order('start_time', { ascending: true });
      
      if (error) {
          console.error('Error fetching Aufguss plan:', error);
          return [];
      }
      return data as AufgussSlot[];
  },
  
  async createAufgussSlot(slotData: Database['public']['Tables']['aufguss_slots']['Insert']) {
    return supabase.from('aufguss_slots').insert(slotData).select('*, profile:profiles(*)').single();
  },

  async deleteAufgussSlot(slotId: number) {
      return supabase.from('aufguss_slots').delete().eq('id', slotId);
  },

  // === Festivals ===
  async getFestivals(): Promise<Festival[]> {
      const { data, error } = await supabase.from('festivals').select('*').order('start_date');
      if (error) {
          console.error('Error fetching festivals:', error);
          return [ // Mock data
              {id: 1, name: 'Sommer-Sauna-Festival', description: 'Unser jährliches Festival zur Sommersonnenwende.', start_date: '2024-06-21', end_date: '2024-06-23', location: 'Hauptstandort'},
              {id: 2, name: 'Winter-Spezial', description: 'Gemütliches Schwitzen im Winter.', start_date: '2024-12-10', end_date: '2024-12-11', location: 'Berg-Chalet'}
          ];
      }
      return data || [];
  }
};

export { supabase, apiClient };