import { createClient, Session, User } from '@supabase/supabase-js';
import { Profile, Post, Database } from './types.ts';

// WICHTIG: Verwenden Sie hier die Umgebungsvariablen, die in Netlify gesetzt sind.
// Vite stellt diese Variablen über 'import.meta.env' zur Verfügung, wenn sie mit VITE_ beginnen.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debugging-Ausgaben (können nach der Fehlersuche entfernt werden)
console.log("DEBUG: Supabase URL from env:", SUPABASE_URL);
console.log("DEBUG: Supabase Anon Key (first 5 chars) from env:", SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 5) : "NOT SET");


if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.error("FEHLER: Supabase URL oder Key sind nicht korrekt als Umgebungsvariablen konfiguriert!");
    // Optional: Hier könnte man die Anwendung in einen Fehlermodus versetzen,
    // um weitere Fehler zu vermeiden.
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

const apiClient = {
    // === Auth ===
    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
        return subscription;
    },

    async login(email, password) {
        // Die Fehlerbehandlung in LoginPage.tsx fängt das error-Objekt hier ab.
        // Das Rückgabeformat { data, error } ist hier bereits gegeben durch Supabase.
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        console.log("DEBUG: Login Response Data:", data);
        console.error("DEBUG: Login Error:", error); // Zusätzliches Logging für den Fehler
        return { data, error };
    },

    async register(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        console.log("DEBUG: Register Response Data:", data);
        console.error("DEBUG: Register Error:", error); // Zusätzliches Logging für den Fehler
        return { data, error };
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
