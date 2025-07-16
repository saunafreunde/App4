import React from 'react';
import { View } from '../App.tsx';
import { Profile } from '../types.ts';

import Sidebar from './Sidebar.tsx';
import Dashboard from './views/Dashboard.tsx';
import SocialFeed from './views/SocialFeed.tsx';
import AufgussPlanner from './views/AufgussPlanner.tsx';
import MembersList from './views/MembersList.tsx';
import ProfilePage from './views/ProfilePage.tsx';
import Festivals from './views/Festivals.tsx';

interface MainLayoutProps {
  view: View;
  setView: (view: View) => void;
  profile: Profile;
}

const MainLayout: React.FC<MainLayoutProps> = ({ view, setView, profile }) => {
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard profile={profile} />;
      case 'social':
        return <SocialFeed profile={profile} />;
      case 'aufguss':
        return <AufgussPlanner profile={profile} />;
      case 'festivals':
        return <Festivals />;
      case 'members':
        return <MembersList />;
      case 'profile':
        return <ProfilePage profile={profile} />;
      default:
        return <Dashboard profile={profile} />;
    }
  };

  return (
    <div id="app-shell">
      <Sidebar view={view} setView={setView} />
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
};

export default MainLayout;
