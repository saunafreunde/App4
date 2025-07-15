import React from 'react';
import { Profile } from '../../types.ts';

interface SocialFeedProps {
    profile: Profile;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ profile }) => {
  return (
    <div>
      <header className="header">
        <h1>Social Feed</h1>
        <p>Tausche dich mit anderen Mitgliedern aus.</p>
      </header>

      <div className="card">
          <h2>Demnächst verfügbar</h2>
          <p>Hier wirst du bald Beiträge erstellen, Bilder teilen und über Vorschläge abstimmen können.</p>
      </div>
    </div>
  );
};

export default SocialFeed;
