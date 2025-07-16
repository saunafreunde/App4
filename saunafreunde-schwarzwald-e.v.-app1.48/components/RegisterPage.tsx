import React, { useState } from 'react';
import { apiClient } from '../apiClient.ts';
import { AppStage } from '../App.tsx';

interface RegisterPageProps {
  setAppStage: (stage: AppStage) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ setAppStage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await apiClient.register(email, password);

    if (error) {
      setError(error.message);
    } else if (data.user) {
      // Erfolg! Der onAuthStateChange-Listener in App.tsx wird ausgelöst
      // und den Stage auf 'profile_setup' setzen.
    }
    setLoading(false);
  };

  return (
    <div className="form-container">
      <div className="card">
        <h2 className="text-center">Werde Teil des Vereins</h2>
        <p className="text-center" style={{ color: 'var(--secondary-text)', marginBottom: '2rem' }}>
          Erstelle ein Konto, um loszulegen.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister}>
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
              placeholder="Mindestens 6 Zeichen"
            />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Registrieren...' : 'Konto erstellen'}
          </button>
        </form>
        <div className="form-footer">
          Bereits Mitglied?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); setAppStage('login'); }}>
            Anmelden
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
