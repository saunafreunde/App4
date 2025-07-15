import React from 'react';
import { Profile } from '../../types.ts';

interface DashboardProps {
    profile: Profile;
}

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  return (
    <div>
        <header className="header">
            <h1>Willkommen zurück, {profile.nickname || profile.name}!</h1>
            <p>Hier ist eine schnelle Übersicht über die Vereinsaktivitäten.</p>
        </header>

        <div className="card">
            <h2>Dashboard</h2>
            <p>Dieser Bereich wird bald mit spannenden Inhalten gefüllt, wie z.B. anstehende Events, deine persönlichen Statistiken und wichtige Ankündigungen.</p>
        </div>
    </div>
  );
};

export default Dashboard;
