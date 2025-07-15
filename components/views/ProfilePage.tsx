import React from 'react';
import { Profile } from '../../types.ts';

interface ProfilePageProps {
    profile: Profile;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile }) => {
  return (
    <div>
       <header className="header">
        <h1>Mein Profil</h1>
        <p>Verwalte deine persönlichen Daten und Einstellungen.</p>
      </header>
      <div className="card">
        <h2>Hallo, {profile.name}</h2>
        <p><strong>Benutzername:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Stammsauna:</strong> {profile.primary_sauna}</p>
        <br/>
        <p>Die Möglichkeit, dein Profil zu bearbeiten, wird in Kürze hinzugefügt.</p>
      </div>
    </div>
  );
};

export default ProfilePage;
