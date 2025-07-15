import React from 'react';

const MembersList: React.FC = () => {
  return (
    <div>
      <header className="header">
        <h1>Mitgliederliste</h1>
        <p>Finde andere Saunafreunde und vernetze dich.</p>
      </header>
      <div className="card">
        <h2>Demnächst verfügbar</h2>
        <p>Hier wirst du bald die Profile anderer Mitglieder durchsuchen und ansehen können (sofern diese zugestimmt haben).</p>
      </div>
    </div>
  );
};

export default MembersList;
