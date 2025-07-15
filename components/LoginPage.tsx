import React, { useState } from 'react';
import { apiClient } from '../apiClient.ts';
import { AppStage } from '../App.tsx';

interface LoginPageProps {
  setAppStage: (stage: AppStage) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setAppStage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await apiClient.login(email, password);
    if (error) {
      setError(error.message);
    }
    // Der onAuthStateChange Listener in App.tsx kümmert sich um den Wechsel der Ansicht
    setLoading(false);
  };

  return (
    <div className="form-container">
      <div className="card">
        <h2 className="text-center">Willkommen zurück!</h2>
        <p className="text-center" style={{ color: 'var(--secondary-text)', marginBottom: '2rem' }}>
          Bitte melde dich an, um fortzufahren.
        </p>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">E-Mail</label>
            <input
              id="email"
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="deine.email@example.com"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>
        <div className="form-footer">
          Noch kein Konto?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); setAppStage('register'); }}>
            Registrieren
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
