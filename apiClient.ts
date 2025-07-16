import { createClient, Session, User } from '@supabase/supabase-js';
import { Profile, Post, Database, AufgussSlot, Festival, Comment, PostRow, AufgussSlotRow } from './types.ts';

// --- WICHTIG: VERWENDUNG VON UMGEBUNGSVARIABLEN ---
// Diese Werte werden während des Builds von Netlify (oder deinem lokalen Vite-Server)
// aus deinen Umgebungsvariablen geladen, die du in Netlify konfiguriert hast.
// Sie dürfen NICHT hartkodiert werden, wenn die App live geht!
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debugging-Ausgaben (können entfernt werden, wenn alles funktioniert)
console.log("DEBUG: Supabase URL from env:", SUPABASE_URL);
console.log("DEBUG: Supabase Anon Key (first 5 chars) from env:", SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 5) : "NOT SET");

// Überprüfung, ob die Umgebungsvariablen gesetzt sind
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("FEHLER: Supabase URL oder Key sind NICHT als Umgebungsvariablen konfiguriert!");
    // In einer Produktionsanwendung solltest du hier eine klarere Fehlermeldung anzeigen
    // oder die App daran hindern, zu starten.
} else if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    // Dies sollte nicht mehr passieren, wenn die Env-Variablen korrekt verwendet werden.
    console.warn("WARNUNG: Bitte ersetzen Sie die Platzhalter 'YOUR_SUPABASE_URL' und 'YOUR_SUPABASE_ANON_KEY' in Ihren Umgebungsvariablen in Netlify.");
}


const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

const apiClient = {
    // === Auth ===
    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
        return subscription;
    },

    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        console.log("DEBUG: Login Response Data:", data); // Zusätzliches Logging
        console.error("DEBUG: Login Error:", error);    // Zusätzliches Logging
        return { data, error };
    },

    async register(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        console.log("DEBUG: Register Response Data:", data); // Zusätzliches Logging
        console.error("DEBUG: Register Error:", error);    // Zusätzliches Logging
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
        return data || [];
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
        if (fetchError || !post) {
            console.error('Error fetching post for like toggle:', fetchError || 'Post not found');
            return { data: null, error: fetchError }; // Rückgabe konsistent machen
        }

        const likes = post.likes || [];
        const newLikes = likes.includes(userId) ? likes.filter(id => id !== userId) : [...likes, userId];

        const { data, error } = await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);
        if (error) {
            console.error('Error updating likes:', error);
        }
        return { data, error }; // Rückgabe konsistent machen
    },

    async addComment(commentData: Database['public']['Tables']['comments']['Insert']): Promise<{ data: Comment | null, error: any }> {
        const { data, error } = await supabase.from('comments').insert(commentData).select('*, profile:profiles(*)').single();
        if (error) {
            console.error('Error adding comment:', error);
        }
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
        return data || [];
    },

    // === Aufguss Planner ===
    async getAufgussPlanForRange(start: string, end: string): Promise<AufgussSlot[]> {
        const { data, error } = await supabase
            .from('aufguss_slots')
            // Hier die explizite Beziehung über den Fremdschlüssel-Constraint-Namen angeben
            .select('*, profile:profiles!fk_claimed_by(id, name, username, avatar_url)')
            .gte('start_time', start)
            .lte('start_time', end)
            .order('start_time', { ascending: true });

        if (error) {
            console.error('Error fetching Aufguss plan:', error);
            // Mock data für Demonstration (kann entfernt werden, wenn alles live läuft)
            return [
                { id: 1, sauna_name: 'Panorama Sauna', start_time: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), end_time: new Date(Date.now() + 2.25 * 3600 * 1000).toISOString(), claimed_by: null, aufguss_type: null, profile: null },
                { id: 2, sauna_name: 'Erdsauna', start_time: new Date(Date.now() + 3 * 3600 * 1000).toISOString(), end_time: new Date(Date.now() + 3.25 * 3600 * 1000).toISOString(), claimed_by: 'mock-user-id', aufguss_type: 'Fruchtig', profile: { id: 'mock-user-id', name: 'Max Mustermann', username: 'max', avatar_url: null } as Profile },
            ];
        }
        return data || [];
    },

    async createAufgussSlot(slotData: Database['public']['Tables']['aufguss_slots']['Insert']) {
        const { data, error } = await supabase.from('aufguss_slots').insert(slotData)
            // Hier die explizite Beziehung über den Fremdschlüssel-Constraint-Namen angeben
            .select('*, profile:profiles!fk_claimed_by(*)')
            .single();
        if (error) {
            console.error('Error creating Aufguss slot:', error);
        }
        return { data, error };
    },

    async deleteAufgussSlot(slotId: number) {
        const { data, error } = await supabase.from('aufguss_slots').delete().eq('id', slotId);
        if (error) {
            console.error('Error deleting Aufguss slot:', error);
        }
        return { data, error }; // Rückgabe konsistent machen
    },

    // === Festivals ===
    async getFestivals(): Promise<Festival[]> {
        const { data, error } = await supabase.from('festivals').select('*').order('start_date');
        if (error) {
            console.error('Error fetching festivals:', error);
            // Mock data für Demonstration (kann entfernt werden, wenn alles live läuft)
            return [
                { id: 1, name: 'Sommer-Sauna-Festival', description: 'Unser jährliches Festival zur Sommersonnenwende.', start_date: '2024-06-21', end_date: '2024-06-23', location: 'Hauptstandort' },
                { id: 2, name: 'Winter-Spezial', description: 'Gemütliches Schwitzen im Winter.', start_date: '2024-12-10', end_date: '2024-12-11', location: 'Berg-Chalet' }
            ];
        }
        return data || [];
    }
};

export { supabase, apiClient };
