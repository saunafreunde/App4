import React, { useState } from 'react';
import { AufgussSlot } from '../types.ts';

interface ClaimAufgussModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (aufgussType: string) => void;
  slotInfo: AufgussSlot;
}

const AUFGUSS_TYPES = [
    "Fruchtig",
    "Birke",
    "Honig",
    "Salz",
    "Menthol-Kristall",
    "Eis & Minze",
    "Latschenkiefer",
    "Überraschung"
];

const ClaimAufgussModal: React.FC<ClaimAufgussModalProps> = ({ isOpen, onClose, onSubmit, slotInfo }) => {
  const [aufgussType, setAufgussType] = useState(AUFGUSS_TYPES[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(aufgussType);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>Aufguss übernehmen</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Schließen">
              <span className="material-icons-outlined">close</span>
            </button>
          </div>
          <div className="modal-body">
            <p>Du übernimmst den Aufguss in der <strong>{slotInfo.sauna_name}</strong> um <strong>{new Date(slotInfo.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Uhr</strong>.</p>
            <div className="input-group">
                <label htmlFor="aufguss-type">Wähle die Art des Aufgusses:</label>
                <select 
                    id="aufguss-type"
                    className="select-field"
                    value={aufgussType}
                    onChange={(e) => setAufgussType(e.target.value)}
                >
                    {AUFGUSS_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Abbrechen</button>
            <button type="submit" className="btn">Bestätigen</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimAufgussModal;
