import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import TicketModal from './Ticket';
import ReviewSection from './ReviewSection';
import './EventCardDetails.css';
import usv from '../Images/usv.jpg';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, MapPin, User, FileText, Heart, ArrowRight } from 'lucide-react';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({ firstName: 'Vizitator', lastName: '', role: 'GUEST' });
    const [currentTicket, setCurrentTicket] = useState(null);
    const [hasTicket, setHasTicket] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    // Mapare culori pentru categorii
    const getCategoryStyle = (cat) => {
        const category = cat?.toUpperCase() || 'OTHER';
        const styles = {
            ACADEMIC: { bg: '#eff6ff', color: '#2563eb' },
            SOCIAL: { bg: '#fff7ed', color: '#ea580c' },
            SPORT: { bg: '#f0fdf4', color: '#16a34a' },
            VOLUNTEERING: { bg: '#fff1f2', color: '#e11d48' },
            CAREER: { bg: '#faf5ff', color: '#9333ea' },
            OTHER: { bg: '#f3f4f6', color: '#6b7280' }
        };
        return styles[category] || styles.OTHER;
    };

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                const rawRole = parsedUser.roles && parsedUser.roles.length > 0 ? parsedUser.roles[0].toUpperCase() : 'GUEST';
                setUser({
                    firstName: parsedUser.firstName || '',
                    lastName: parsedUser.lastName || '',
                    role: rawRole.replace('ROLE_', '') 
                });
            } catch (e) { console.error(e); }
        }
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const eventRes = await api.get(`/events/${id}`);
            let eventData = eventRes.data;
            const seatsInDb = eventData.occupiedSeats ?? eventData.participantCount ?? 0;
            setEvent({ ...eventData, occupiedSeats: seatsInDb });

            const userData = localStorage.getItem('user');
            if (userData && userData.includes('STUDENT')) {
                try {
                    const favRes = await api.get(`/favorites/check/${id}`);
                    setIsFavorite(favRes.data);
                } catch (e) {}

                const myTicketsRes = await api.get('/tickets/my-tickets');
                const foundTicket = myTicketsRes.data.find(t => 
    t.eventId === parseInt(id) || 
    (t.event && t.event.id === parseInt(id)) ||
    t.eventTitle === eventData.title // Căutare de rezervă după titlu
);

                const localTicketFlag = localStorage.getItem(`booked_${id}`);
                if (foundTicket) {
                    setCurrentTicket(foundTicket);
                    setHasTicket(true);
                    localStorage.setItem(`booked_${id}`, 'true');
                } else if (localTicketFlag === 'true') {
                    setHasTicket(true);
                } else {
                    setHasTicket(false);
                }
            }
        } catch (error) {
            console.error("Eroare la încărcare date:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleToggleFavorite = async () => {
        try {
            if (isFavorite) {
                await api.delete(`/favorites/${id}`);
                setIsFavorite(false);
                toast.success('Eliminat de la favorite');
            } else {
                await api.post(`/favorites/${id}`);
                setIsFavorite(true);
                toast.success('Adăugat la favorite!', { icon: '❤️' });
            }
        } catch (error) { toast.error('Eroare la favorite.'); }
    };

    const handleBuyTicket = () => {
        if (user.role !== 'STUDENT') { toast.error('Doar studenții pot rezerva locuri!'); return; }
        if (hasTicket) { setShowTicketModal(true); return; }
        const previewTicket = {
            eventTitle: event.title,
            eventLocation: event.location,
            eventStartTime: event.startTime,
            studentName: `${user.firstName} ${user.lastName}`,
            isPreview: true 
        };
        setCurrentTicket(previewTicket);
        setShowTicketModal(true);
    };

    const handleTicketAddedToWallet = async () => {
        try {
            const response = await api.post('/tickets', { eventId: id });
            setCurrentTicket(response.data);
            setHasTicket(true);
            localStorage.setItem(`booked_${id}`, 'true');
            setEvent(prev => ({
                ...prev,
                occupiedSeats: (Number(prev.occupiedSeats) || 0) + 1
            }));
            setShowTicketModal(false);
            toast.success('Bilet rezervat cu succes!');
            setTimeout(() => fetchData(), 1000); 
        } catch (error) { 
            console.error(error);
            toast.error('Eroare: Nu s-a putut salva biletul.'); 
        }
    };

    if (loading) return <div className="loader">Se încarcă...</div>;
    if (!event) return <div className="error">Eveniment negăsit.</div>;

    const occupancyRate = event.maxCapacity ? Math.min((event.occupiedSeats / event.maxCapacity) * 100, 100) : 0;
    const formattedDate = new Date(event.startTime).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedTime = new Date(event.startTime).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
    
    // Stil etichetă
    const catStyle = getCategoryStyle(event.category);

    return (
        <div className="ed-page-wrapper">
            <div className="ed-hero-header" style={{ backgroundImage: `url(${event.imageUrl || usv})` }}>
                <div className="ed-hero-fade-overlay" style={{ pointerEvents: 'none' }}>
                    {/*<button className="ed-back-circle-btn" onClick={() => navigate(-1)} style={{ pointerEvents: 'auto' }}>←</button>*/}
                    <div className="ed-hero-bottom-content" style={{ pointerEvents: 'auto' }}>
                        <span 
                            className="ed-category-badge" 
                            style={{ backgroundColor: catStyle.bg, color: catStyle.color }}
                        >
                            {event.category || 'EVENT'}
                        </span>
                        <h1 className="ed-main-headline">
                            {event.title}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="ed-main-container">
                <div className="ed-content-grid">
                    <div className="ed-left-content">
                        <div className="ed-details-horizontal-bar" style={{border:"1px solid rgba(192, 192, 192, 1)", borderRadius:'30px', padding:'25px'}}>
                            <div className="ed-bar-segment">
                                <div className="ed-icon-squircle orange"><User size={22} /></div>
                                <div><label>ORGANIZATOR</label><span>{event.organizer?.firstName} {event.organizer?.lastName}</span></div>
                            </div>
                            <div className="ed-bar-segment">
                                <div className="ed-icon-squircle blue"><Calendar size={22} /></div>
                                <div><label>DATA</label><span>{formattedDate}</span></div>
                            </div>
                            <div className="ed-bar-segment">
                                <div className="ed-icon-squircle pink"><Clock size={22} /></div>
                                <div><label>ORA</label><span>{formattedTime}</span></div>
                            </div>
                             <div className="ed-bar-segment">
                                <div className="ed-icon-squircle purple"><MapPin size={22} /></div>
                                <div><label>LOCAȚIE</label><span>{event.location}</span></div>
                            </div>
                        </div>

                        <div className="ed-section-block" style={{border:"1px solid rgba(192, 192, 192, 1)", borderRadius:'30px'}}>
                            <h3 className="ed-block-title">Despre eveniment</h3>
                            <p className="ed-body-text" style={{ whiteSpace: 'pre-line' }}>{event.description}</p>
                        </div>

                        {event.materials?.length > 0 && (
                            <div className="ed-section-block" style={{border:"1px solid rgba(192, 192, 192, 1)", borderRadius:'30px', position: 'relative', zIndex: 5}}>
                                <h3 className="ed-block-title"> Materiale și Resurse</h3>
                                <div className="ed-materials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', marginTop: '20px' }}>
                                    {event.materials.map((mat, i) => (
                                        <a key={i} href={mat.url || mat.fileUrl} target="_blank" rel="noopener noreferrer" className="ed-material-card-modern" style={{border:'1px solid gray', borderRadius:'20px', padding:'25px'}}>
                                            <div className="mat-icon-box"><FileText size={20}  /></div>
                                            <div className="mat-info-box">
                                                <span className="mat-name-text">{mat.fileName || `Document ${i+1}`}</span>
                                                <span className="mat-sub-text">Descarcă resursa</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="ed-section-block">
                             <ReviewSection eventId={id} userRole={user.role} />
                        </div>
                    </div>

                    <div className="ed-right-sidebar">
                        <div className="ed-booking-card sticky">
                            <h3>Rezervă un loc</h3>
                            <div className="ed-progress-container">
                                <div className="ed-progress-labels">
                                    <span>Locuri ocupate</span>
                                    <span className="highlight">
                                        {event.occupiedSeats || 0}/{event.maxCapacity || 0}
                                    </span>
                                </div>
                                <div className="ed-progress-bar-bg">
                                    <div className="ed-progress-bar-fill" style={{ width: `${occupancyRate}%`, transition: 'width 0.5s ease' }}></div>
                                </div>
                            </div>

                            {hasTicket ? (
                                <button className="ed-cta-btn success" style={{ backgroundColor: '#10b981', color: 'white' }} onClick={() => setShowTicketModal(true)}>
                                    ✅ Vezi Biletul Tău
                                </button>
                            ) : (
                                <button 
                                    className="ed-cta-btn primary" 
                                    onClick={handleBuyTicket} 
                                    disabled={user.role !== 'STUDENT' || (event.occupiedSeats >= event.maxCapacity)}
                                >
                                    {event.occupiedSeats >= event.maxCapacity ? 'Locuri epuizate' : <>Rezervă acum <ArrowRight size={20} /></>}
                                </button>
                            )}

                            {user.role === 'STUDENT' && (
                                <button className={`ed-fav-button-outline ${isFavorite ? 'active' : ''}`} onClick={handleToggleFavorite}>
                                    <Heart size={18} fill={isFavorite ? "#ff6b6b" : "none"} color={isFavorite ? "#ff6b6b" : "#64748b"} />
                                    <span>{isFavorite ? 'Adăugat la favorite' : 'Adaugă la favorite'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showTicketModal && currentTicket && (
                <TicketModal 
                    ticketData={currentTicket} 
                    onClose={() => setShowTicketModal(false)} 
                    onAddToWallet={handleTicketAddedToWallet} 
                    isSaved={hasTicket} 
                    hideWallet={hasTicket && !currentTicket.isPreview} 
                />
            )}
        </div>
    );
};

export default EventDetails;