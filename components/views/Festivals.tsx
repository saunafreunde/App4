import React, { useState, useEffect } from 'react';
import { apiClient } from '../../apiClient.ts';
import { Festival } from '../../types.ts';
import Loader from '../Loader.tsx';

const Festivals: React.FC = () => {
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFestivals = async () => {
            setLoading(true);
            const data = await apiClient.getFestivals();
            setFestivals(data);
            setLoading(false);
        };
        fetchFestivals();
    }, []);

    if (loading) return <Loader />;

    return (
        <div>
            <header className="header">
                <h1>Festivals & Events</h1>
                <p>Übersicht über alle anstehenden und vergangenen Vereins-Festivals.</p>
            </header>
            
            {festivals.length === 0 ? (
                <div className="card">
                    <h2>Keine Festivals geplant</h2>
                    <p>Aktuell sind keine Festivals in Planung. Schau bald wieder vorbei!</p>
                </div>
            ) : (
                <div className="festivals-list">
                    {festivals.map(festival => (
                        <div key={festival.id} className="card festival-card">
                            <h3>{festival.name}</h3>
                            <p className="festival-dates">
                                {new Date(festival.start_date).toLocaleDateString('de-DE')} - {new Date(festival.end_date).toLocaleDateString('de-DE')}
                            </p>
                            <p className="festival-location">Ort: {festival.location}</p>
                            <p>{festival.description}</p>
                            <div className="festival-actions">
                                <button className="btn btn-secondary" disabled>Details ansehen</button>
                                <button className="btn" disabled>Teilnehmen (RSVP)</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
             <div className="card" style={{marginTop: '2rem'}}>
                <h2>Zukünftige Funktionen</h2>
                <ul style={{listStylePosition: 'inside'}}>
                    <li>Detaillierte Festivalansicht mit Aufgussplan & Aufgaben</li>
                    <li>RSVP-Funktionalität</li>
                    <li>Verfügbarkeiten für Aufgüsse eintragen</li>
                    <li>Aufgaben für das Festival übernehmen</li>
                    <li>Arbeitsstunden nach dem Festival eintragen</li>
                </ul>
            </div>
        </div>
    );
};

export default Festivals;
