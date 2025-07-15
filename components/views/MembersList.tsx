import React, { useState, useEffect } from 'react';
import { apiClient } from '../../apiClient.ts';
import { Profile } from '../../types.ts';
import Loader from '../Loader.tsx';


const MembersList: React.FC = () => {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const data = await apiClient.getMembers();
      setMembers(data);
      setLoading(false);
    };
    fetchMembers();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <header className="header">
        <h1>Mitgliederliste</h1>
        <p>Finde andere Saunafreunde und vernetze dich.</p>
      </header>
      
      {members.length > 0 ? (
        <div className="members-grid">
          {members.map(member => (
            <div key={member.id} className="card member-card">
              <img src={member.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${member.name}`} alt={member.username} className="member-avatar" />
              <h3 className="member-name">{member.name}</h3>
              <p className="member-username">@{member.username}</p>
              <p className="member-sauna">Stammsauna: {member.primary_sauna}</p>
              <button className="btn btn-secondary btn-small" style={{marginTop: '1rem'}}>Profil ansehen</button>
            </div>
          ))}
        </div>
      ) : (
         <div className="card">
          <p className="text-center">Keine Mitglieder gefunden.</p>
        </div>
      )}
    </div>
  );
};

export default MembersList;
