import React from 'react';
import { View } from '../App.tsx';
import { apiClient } from '../apiClient.ts';

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ view, setView }) => {
    const handleLogout = async () => {
        await apiClient.logout();
        // Der onAuthStateChange Listener in App.tsx kümmert sich um den Rest.
    };
    
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Saunafreunde</h2>
        <p style={{color: 'var(--secondary-text)', fontSize: '0.8rem'}}>Schwarzwald e.V.</p>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <a href="#" className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>
              <span className="material-icons-outlined">dashboard</span> Dashboard
            </a>
          </li>
          <li>
            <a href="#" className={view === 'social' ? 'active' : ''} onClick={() => setView('social')}>
              <span className="material-icons-outlined">groups</span> Social Feed
            </a>
          </li>
          <li>
            <a href="#" className={view === 'aufguss' ? 'active' : ''} onClick={() => setView('aufguss')}>
              <span className="material-icons-outlined">local_fire_department</span> Aufgussplan
            </a>
          </li>
          <li>
            <a href="#" className={view === 'festivals' ? 'active' : ''} onClick={() => setView('festivals')}>
              <span className="material-icons-outlined">celebration</span> Festivals
            </a>
          </li>
           <li>
            <a href="#" className={view === 'members' ? 'active' : ''} onClick={() => setView('members')}>
              <span className="material-icons-outlined">badge</span> Mitglieder
            </a>
          </li>
          <li>
            <a href="#" className={view === 'profile' ? 'active' : ''} onClick={() => setView('profile')}>
              <span className="material-icons-outlined">account_circle</span> Mein Profil
            </a>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button className="btn btn-secondary" onClick={handleLogout}>
            <span className="material-icons-outlined" style={{verticalAlign: 'middle', marginRight: '0.5rem'}}>logout</span>
            Abmelden
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
