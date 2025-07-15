import React, { useState, useEffect } from 'react';
import { apiClient } from '../../apiClient.ts';
import { AufgussSlot, Profile } from '../../types.ts';
import Loader from '../Loader.tsx';

interface AufgussPlannerProps {
    profile: Profile;
}

const AufgussPlanner: React.FC<AufgussPlannerProps> = ({ profile }) => {
    const [slots, setSlots] = useState<AufgussSlot[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSlots = async () => {
        setLoading(true);
        const data = await apiClient.getAufgussPlan();
        setSlots(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    const handleClaim = async (slotId: number) => {
        const aufgussType = prompt("Welche Art von Aufguss möchtest du machen? (z.B. 'Birke', 'Menthol-Kristall')");
        if (aufgussType) {
            const { data, error } = await apiClient.claimAufguss(slotId, profile.id, aufgussType);
            if (data) {
                // Refresh list to show the update
                fetchSlots();
            } else {
                alert(`Fehler beim Beanspruchen: ${error.message}`);
            }
        }
    };
    
    const handleCancel = async (slotId: number) => {
        // Penalty check could happen here. e.g. if slot start_time is within 24h
        const slotToCancel = slots.find(s => s.id === slotId);
        if (slotToCancel && new Date(slotToCancel.start_time).getTime() - Date.now() < 24 * 3600 * 1000) {
            if (!confirm("Achtung: Dieser Aufguss ist in weniger als 24 Stunden. Eine kurzfristige Stornierung wird vermerkt. Trotzdem fortfahren?")) {
                return;
            }
        }

        if (confirm("Möchtest du diesen Aufguss wirklich stornieren?")) {
            const { error } = await apiClient.cancelAufguss(slotId);
            if (!error) {
                fetchSlots();
            } else {
                alert(`Fehler beim Stornieren: ${error.message}`);
            }
        }
    };
    
    const handleShare = (slot: AufgussSlot) => {
        // Cooldown logic needs to be implemented based on profile.last_aufguss_share_timestamp
        alert(`Teilen-Funktion für '${slot.aufguss_type}' um ${new Date(slot.start_time).toLocaleTimeString()} in der ${slot.sauna_name} wird bald verfügbar sein!`);
    }

    if (loading) return <Loader />;

    return (
        <div>
            <header className="header">
                <h1>Aufgussplaner</h1>
                <p>Plane und übernehme Aufgüsse für die Community.</p>
            </header>

            <div className="card">
                <h2>Verfügbare Aufgüsse</h2>
                {slots.length > 0 ? (
                    <div className="aufguss-plan">
                        {slots.map(slot => (
                            <div key={slot.id} className="aufguss-slot">
                               <div>
                                    <span className="slot-time">{new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="slot-sauna">{slot.sauna_name}</span>
                               </div>
                               <div className="slot-details">
                                   {slot.claimed_by && slot.profile ? (
                                       <>
                                        <div className="claimed-by">
                                            <img src={slot.profile?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${slot.profile.name}`} alt={slot.profile?.username} className="avatar-small" />
                                            <span>{slot.profile?.name} - <strong>{slot.aufguss_type}</strong></span>
                                        </div>
                                        {slot.claimed_by === profile.id ? (
                                            <div className="slot-actions">
                                                <button className="btn btn-secondary btn-small" onClick={() => handleCancel(slot.id)}>Stornieren</button>
                                                <button className="btn btn-small" onClick={() => handleShare(slot)}>Im Feed teilen</button>
                                            </div>
                                        ) : null}
                                       </>
                                   ) : (
                                       <>
                                         <span>Frei</span>
                                         <button className="btn btn-small" onClick={() => handleClaim(slot.id)}>Übernehmen</button>
                                       </>
                                   )}
                               </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center" style={{padding: '1rem'}}>Aktuell sind keine Aufguss-Slots verfügbar.</p>
                )}
            </div>
        </div>
    );
};

export default AufgussPlanner;
