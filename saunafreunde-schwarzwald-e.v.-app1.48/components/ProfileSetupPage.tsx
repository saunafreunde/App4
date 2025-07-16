import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { apiClient } from '../apiClient.ts';
import { Profile } from '../types.ts';
import { AppStage } from '../App.tsx';

interface ProfileSetupPageProps {
  session: Session | null;
  setAppStage: (stage: AppStage) => void;
  setProfile: (profile: Profile) => void;
}

const ProfileSetupPage: React.FC<ProfileSetupPageProps> = ({ session, setAppStage, setProfile }) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [primarySauna, setPrimarySauna] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setError("Keine aktive Sitzung gefunden. Bitte erneut anmelden.");
      return;
    }
    
    setLoading(true);
    setError(null);

    const profileData: Omit<Profile, 'created_at' | 'last_profile_update' | 'last_aufguss_share_timestamp' | 'id'> & { id: string } = {
      id: session.user.id,
      email: session.user.email!,
      username,
      name,
      primary_sauna: primarySauna,
      aufguss_count: 0,
      work_hours: 0,
      short_notice_cancellations: 0,
      is_admin: false,
      show_in_member_list: true,
      avatar_url: null,
      nickname: null,
      phone: null,
      motto: null,
      qualifications: null,
      awards: null,
      permissions: null,
    };
    
    const { data, error } = await apiClient.createProfile(profileData);
    
    if (error) {
        setError(error.message);
    } else if (data) {
        setProfile(data);
        setAppStage('loggedIn');
    }
    setLoading(false);
  };

  return (
    <div className="form-container">
      <div className="card">
        <h2 className="text-center">Profil einrichten</h2>
        <p className="text-center" style={{ color: 'var(--secondary-text)', marginBottom: '2rem' }}>
          Vervollständige dein Profil, um fortzufahren.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Benutzername (öffentlich)</label>
            <input id="username" className="input-field" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="name">Voller Name</label>
            <input id="name" className="input-field" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="primary_sauna">Stammsauna</label>
            <input id="primary_sauna" className="input-field" type="text" value={primarySauna} onChange={(e) => setPrimarySauna(e.target.value)} required />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Speichern...' : 'Profil speichern & Fortfahren'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupPage;