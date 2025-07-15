import { createClient, Session, User } from '@supabase/supabase-js';
import { Profile, Post, Database } from './types.ts';

// WICHTIG: Ersetzen Sie diese Platzhalter durch Ihre echten Supabase-Umgebungsvariablen.
// In einer echten Produktionsumgebung würden diese sicher über Umgebungsvariablen geladen.
const SUPABASE_URL = https://khmugixdvuvifnrqxzbn.supabase.co; // HIER IHRE SUPABASE URL EINFÜGEN
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobXVnaXhkdnV2aWZucnF4emJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MDUzNzcsImV4cCI6MjA2ODE4MTM3N30.JtpTOxCl1_qoI1dHvxFYF41hq1yRShwE5MmdXiLtquE; // HIER IHREN SUPABASE ANON KEY EINFÜGEN

if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn("Supabase URL und Key sind nicht konfiguriert. Bitte aktualisieren Sie apiClient.ts");
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  
  async createProfile(profileData: Omit<Profile, 'created_at' | 'last_profile_update'>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData as Partial<Profile>)
      .select()
      .single();
    if (error) {
        console.error("Error creating profile:", error);
    }
    return { data, error };
  },

  // === Posts ===
  async getPosts(): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profile:profiles(*)') // Join mit der profiles-Tabelle
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
    return data as any[];
  },

  async addPost(postData: Partial<Post>, imageFile?: File): Promise<{ data: Post | null; error: any }> {
    let imageUrl: string | undefined = undefined;

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
        .select()
        .single();
        
    return { data, error };
  },

  // Placeholder für weitere Funktionen
  async getAufgussPlan() { /* ... */ return []; },
  async claimAufguss(aufgussId: string, userId: string, type: string) { /* ... */ },
};

export { supabase, apiClient };
