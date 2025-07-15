import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { apiClient } from './apiClient.ts';
import { Profile } from './types.ts';

import Loader from './components/Loader.tsx';
import LoginPage from './components/LoginPage.tsx';
import RegisterPage from './components/RegisterPage.tsx';
import ProfileSetupPage from './components/ProfileSetupPage.tsx';
import MainLayout from './components/MainLayout.tsx';

export type AppStage = 'loading' | 'login' | 'register' | 'profile_setup' | 'loggedIn';
export type View = 'dashboard' | 'social' | 'aufguss' | 'festivals' | 'members' | 'profile';

function App() {
  const [appStage, setAppStage] = useState<AppStage>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [view, setView] = useState<View>('dashboard');

  useEffect(() => {
    // Initialer Auth-Check
    apiClient.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const userProfile = await apiClient.getUserProfile(session.user.id);
        if (userProfile) {
          setProfile(userProfile);
          setAppStage('loggedIn');
        } else {
          // Neuer Benutzer, der sein Profil einrichten muss
          setAppStage('profile_setup');
        }
      } else {
        setAppStage('login');
      }
    });
  }, []);

  const renderContent = () => {
    switch (appStage) {
      case 'loading':
        return <Loader />;
      case 'login':
        return <LoginPage setAppStage={setAppStage} />;
      case 'register':
        return <RegisterPage setAppStage={setAppStage} />;
      case 'profile_setup':
        return <ProfileSetupPage session={session} setAppStage={setAppStage} setProfile={setProfile} />;
      case 'loggedIn':
        if (profile && session) {
          return <MainLayout view={view} setView={setView} profile={profile} />;
        }
        // Fallback, sollte nicht passieren
        return <Loader />;
      default:
        return <LoginPage setAppStage={setAppStage} />;
    }
  };

  return <>{renderContent()}</>;
}

export default App;
