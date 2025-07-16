
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiClient } from '../../apiClient.ts';
import { AufgussSlot, AufgussSlotRow, Profile } from '../../types.ts';
import Loader from '../Loader.tsx';
import ClaimAufgussModal from '../ClaimAufgussModal.tsx';

interface AufgussPlannerProps {
    profile: Profile;
}

const generateWeeklySchedule = (weekStartDate: Date): AufgussSlot[] => {
    const slots: AufgussSlot[] = [];
    const saunas = ["80 Grad Sauna", "100 Grad Sauna"];
    const location = "Panoramabad Freudenstadt";
    let tempIdCounter = -1;

    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStartDate);
        day.setDate(day.getDate() + i);
        const dayOfWeek = day.getDay(); // 0=Sonntag, 1=Montag, ...

        let hours: number[] = [];
        // Di, Mi, Do (2, 3, 4)
        if ([2, 3, 4].includes(dayOfWeek)) {
            for (let h = 14; h <= 20; h++) hours.push(h);
        }
        // Fr, Sa, So (5, 6, 0)
        if ([5, 6, 0].includes(dayOfWeek)) {
            for (let h = 11; h <= 20; h++) hours.push(h);
        }

        for (const sauna of saunas) {
            for (const hour of hours) {
                const startTime = new Date(day);
                startTime.setHours(hour, 0, 0, 0);
                const endTime = new Date(startTime);
                endTime.setMinutes(endTime.getMinutes() + 15);

                slots.push({
                    id: tempIdCounter--, // Use a unique negative number for placeholders
                    sauna_name: `${sauna} - ${location}`,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    claimed_by: null,
                    aufguss_type: null,
                    profile: null,
                });
            }
        }
    }
    return slots;
};

const mergeSchedules = (generated: AufgussSlot[], claimed: AufgussSlot[]): AufgussSlot[] => {
    return generated.map(genSlot => {
        const claimedSlot = claimed.find(clSlot =>
            clSlot.sauna_name === genSlot.sauna_name &&
            new Date(clSlot.start_time).getTime() === new Date(genSlot.start_time as string).getTime()
        );
        return claimedSlot ? { ...genSlot, ...claimedSlot } : genSlot;
    });
};


const AufgussPlanner: React.FC<AufgussPlannerProps> = ({ profile }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [slots, setSlots] = useState<AufgussSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<AufgussSlot | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const { weekStart, weekEnd, weekLabel } = useMemo(() => {
        const date = new Date(currentDate);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const weekStart = new Date(date.setDate(diff));
        weekStart.setHours(0,0,0,0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23,59,59,999);

        const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
        const weekLabel = `${weekStart.toLocaleDateString('de-DE', options)} - ${weekEnd.toLocaleDateString('de-DE', options)}`;

        return { weekStart, weekEnd, weekLabel };
    }, [currentDate]);

    const loadScheduleForWeek = useCallback(async () => {
        setLoading(true);
        const generated = generateWeeklySchedule(weekStart);
        const claimed = await apiClient.getAufgussPlanForRange(weekStart.toISOString(), weekEnd.toISOString());
        const merged = mergeSchedules(generated, claimed);
        
        const groupedByDay = merged.reduce((acc, slot) => {
            const dayKey = new Date(slot.start_time).toDateString();
            if (!acc[dayKey]) acc[dayKey] = [];
            acc[dayKey].push(slot);
            return acc;
        }, {} as Record<string, AufgussSlot[]>);
        
        for (const day in groupedByDay) {
            groupedByDay[day].sort((a,b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
        }

        setSlots(Object.values(groupedByDay).flat());
        setLoading(false);
    }, [weekStart, weekEnd]);
    
    useEffect(() => {
        loadScheduleForWeek();
    }, [loadScheduleForWeek, refreshKey]);

    const handleClaimClick = (slot: AufgussSlot) => {
        setSelectedSlot(slot);
        setIsModalOpen(true);
    };
    
    const handleConfirmClaim = async (aufgussType: string) => {
        if (!selectedSlot) return;

        const slotData: Omit<AufgussSlotRow, 'id'> = {
            sauna_name: selectedSlot.sauna_name,
            start_time: selectedSlot.start_time,
            end_time: selectedSlot.end_time,
            claimed_by: profile.id,
            aufguss_type: aufgussType
        };
        const { error } = await apiClient.createAufgussSlot(slotData);

        if (error) {
            alert(`Fehler beim Beanspruchen: ${error.message}`);
        } else {
            setRefreshKey(k => k + 1); // trigger refresh
        }
        setIsModalOpen(false);
        setSelectedSlot(null);
    };

    const handleCancel = async (slotId: number) => {
        if (slotId < 0) { // Don't try to delete placeholder slots
            alert("Dieser Slot kann nicht storniert werden, da er noch nicht übernommen wurde.");
            return;
        }
        
        const slotToCancel = slots.find(s => s.id === slotId);
        if (!slotToCancel) return;
        
        if (new Date(slotToCancel.start_time).getTime() - Date.now() < 24 * 3600 * 1000) {
            if (!confirm("Achtung: Dieser Aufguss ist in weniger als 24 Stunden. Eine kurzfristige Stornierung wird vermerkt. Trotzdem fortfahren?")) {
                return;
            }
        }

        if (confirm("Möchtest du diesen Aufguss wirklich stornieren?")) {
            const { error } = await apiClient.deleteAufgussSlot(slotId);
            if (!error) {
                setRefreshKey(k => k + 1); // trigger refresh
            } else {
                alert(`Fehler beim Stornieren: ${error.message}`);
            }
        }
    };
    
    const handleShare = (slot: AufgussSlot) => {
        alert(`Teilen-Funktion für '${slot.aufguss_type}' wird bald verfügbar sein!`);
    }

    const changeWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
        setCurrentDate(newDate);
    }
    
    const groupedSlots = slots.reduce((acc, slot) => {
        const day = new Date(slot.start_time).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[day]) acc[day] = [];
        acc[day].push(slot);
        return acc;
    }, {} as Record<string, AufgussSlot[]>);


    return (
        <div>
            <header className="header">
                <h1>Aufgussplaner</h1>
                <p>Plane und übernehme Aufgüsse für die Community.</p>
            </header>

            <div className="card">
                <div className="aufguss-header">
                    <button className="btn btn-secondary btn-small" onClick={() => changeWeek('prev')}>&lt; Vorherige Woche</button>
                    <h2 style={{margin: 0}}>{weekLabel}</h2>
                    <button className="btn btn-secondary btn-small" onClick={() => changeWeek('next')}>Nächste Woche &gt;</button>
                </div>
                 {loading ? <Loader /> : Object.keys(groupedSlots).length > 0 ? (
                    Object.entries(groupedSlots).map(([day, daySlots]) => (
                        <div key={day} className="aufguss-day">
                            <h3>{day}</h3>
                            <div className="aufguss-plan">
                                {daySlots.map(slot => (
                                    <div key={slot.id} className="aufguss-slot">
                                        <div className="slot-info">
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
                                                        <button className="btn btn-small" onClick={() => handleShare(slot)}>Teilen</button>
                                                    </div>
                                                ) : null}
                                               </>
                                           ) : (
                                               <>
                                                 <span>Frei</span>
                                                 <button className="btn btn-small" onClick={() => handleClaimClick(slot)}>Übernehmen</button>
                                               </>
                                           )}
                                       </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center" style={{padding: '2rem'}}>Für diese Woche sind keine Aufguss-Zeiten geplant.</p>
                )}
            </div>
            {isModalOpen && selectedSlot && (
                <ClaimAufgussModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleConfirmClaim}
                    slotInfo={selectedSlot}
                />
            )}
        </div>
    );
};

export default AufgussPlanner;
