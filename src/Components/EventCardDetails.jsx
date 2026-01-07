import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import TicketModal from './Ticket';
import ReviewSection from './ReviewSection';
import './EventCardDetails.css';
import usv from '../Images/usv.jpg';
import { toast } from 'react-hot-toast';


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


  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const rawRole = parsedUser.roles && parsedUser.roles.length > 0 
                        ? parsedUser.roles[0].toUpperCase() 
                        : 'GUEST';
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
      setEvent(eventRes.data);

      const userData = localStorage.getItem('user');
      const isStudent = userData && userData.includes('STUDENT');

      if (isStudent) {
        try {
            try {
              const favRes = await api.get(`/favorites/check/${id}`);
              setIsFavorite(favRes.data);
            } catch (e) { console.error("Ignorat eroare fav", e); }

      
const myTicketsRes = await api.get('/tickets/my-tickets');

const foundTicket = myTicketsRes.data.find(t => t.eventId === parseInt(id) || t.eventTitle === eventRes.data.title);

if (foundTicket) {
    setCurrentTicket(foundTicket);
    setHasTicket(true); 
    localStorage.setItem(`wallet_added_${id}`, 'true'); 
} else {
    setCurrentTicket(null);
    setHasTicket(false);
    localStorage.removeItem(`wallet_added_${id}`);
}
        } catch (e) { console.error("Eroare verificare bilet:", e); }
      }
    } catch (error) {
      console.error("Eroare încărcare:", error);
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
              toast.success('Eliminat de la favorite', { duration: 1500 });
          } else {
              await api.post(`/favorites/${id}`);
              setIsFavorite(true);
              toast.success('Adaugat la favorite!', { icon: '❤️', duration: 1500 });
          }
      } catch (error) {
          toast.error('Eroare la actualizare favorite.');
      }
  };

  const handleOpenTicket = () => setShowTicketModal(true);
  
  const handleBuyTicket = () => {
    
    if (user.role !== 'STUDENT') {
        toast.error('Trebuie sa fii autentificat ca STUDENT!');
        return;
    }
    if (currentTicket && currentTicket.id) { 
        setShowTicketModal(true); 
        return; 
    }
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
          localStorage.setItem(`wallet_added_${id}`, 'true');
           setShowTicketModal(false);
          toast.success('Bilet salvat!');

          
          setEvent(prevEvent => {
              if (prevEvent && prevEvent.maxCapacity) {
                  return {
                      ...prevEvent,
                      maxCapacity: prevEvent.maxCapacity - 1
                  };
              }
              return prevEvent;
          });

      } catch (error) {
        console.error(error);
        toast.error('Eroare: Nu s-a putut salva biletul.');
   }
  };

 
  const formatDateFull = (iso) => iso ? new Date(iso).toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "-";
  const formatTimeSimple = (iso) => iso ? new Date(iso).toLocaleTimeString('ro-RO', {hour:'2-digit', minute:'2-digit'}) : "-";

  if (loading) return <div className="loading-screen">Se incarca...</div>;
  if (!event) return <div className="error-screen">Eveniment inexistent.</div>;

  return (
    <div className="page-background">
    
      <div className="main-card-container">
        
       
        <div className="hero-section">
           <img 
              src={event.imageUrl || usv} 
              alt={event.title} 
              className="hero-image" 
              onError={(e)=>{e.target.src=usv}}
           />
           
           <div className="hero-overlay-gradient"></div>

          
           <div className="hero-top-actions">
               <button className="circle-btn back-btn" onClick={() => navigate(-1)} style={{background:"white", color:"black", borderRadius:'30%', border:'1px solid black'}}>
                   ←
               </button>
               {user.role === 'STUDENT' && (
                   <button className="circle-btn fav-btn" onClick={handleToggleFavorite}>
                       {isFavorite ? '❤️' : '🤍'}
                   </button>
               )}
           </div>

        
           <div className="hero-content">
               <span className="category-pill">{event.category || 'EVENT'}</span>
               <h1 className="hero-title">{event.title}</h1>
           </div>
        </div>

      
        <div className="body-content">
        
            <div className="info-grid">
                
              
                <div className="info-box">
                    <h3>Detalii eveniment</h3>
                    <div className="divider-line"></div>
                    
                    <div className="detail-row">
                        <span className="detail-icon">📅</span>
                        <div>
                            <span className="detail-label">Dată</span>
                            <span className="detail-value">{formatDateFull(event.startTime)}</span>
                        </div>
                    </div>

                    <div className="divider-line"></div>

                    <div className="detail-row">
                        <span className="detail-icon">⏰</span>
                        <div>
                            <span className="detail-label">Oră</span>
                            <span className="detail-value">{formatTimeSimple(event.startTime)}</span>
                        </div>
                    </div>

                    <div className="divider-line"></div>

                    <div className="detail-row">
                        <span className="detail-icon">📍</span>
                        <div>
                            <span className="detail-label">Locație</span>
                            <span className="detail-value">{event.location}</span>
                        </div>
                    </div>

                    <div className="divider-line"></div>

                    <div className="detail-row">
                        <span className="detail-icon">👤</span>
                        <div>
                            <span className="detail-label">Organizator</span>
                            <span className="detail-value">{event.organizer?.firstName} {event.organizer?.lastName}</span>
                        </div>
                    </div>
                </div>

                
                <div className="info-box">
                    <h3>Despre acest eveniment</h3>
                    <p className="description-text">
                        {event.description || "Nu există descriere disponibilă."}
                    </p>
                </div>
            </div>

           
            <div className="ticket-box">
                <div className="ticket-header">
                    <span className="ticket-label-small">Locuri disponibile</span>
                    <span className="ticket-count-big">
                        {event.maxCapacity ? `${event.maxCapacity} rămase` : "Nelimitat"}
                    </span>
                </div>
                
                {hasTicket ? (
                    <button className="big-action-btn btn-green" onClick={handleOpenTicket}>
                        ✅ Vezi Biletul
                    </button>
                ) : (
                    <button 
                        className="big-action-btn btn-red" 
                        onClick={handleBuyTicket}
                        disabled={user.role !== 'STUDENT'}
                        style={user.role !== 'STUDENT' ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#999', borderColor: '#999' } : {}}
                        title={user.role !== 'STUDENT' ? "Trebuie să fii autentificat ca student pentru a participa" : "Participă la eveniment"}
                    >
                        Participă
                    </button>
                )}
            </div>

       
            {event.materials && event.materials.length > 0 && (
                <div className="materials-section-container" style={{ margin: '30px 0' }}>
                    <div className="info-box" style={{ width: '100%' }}>
                         <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px'}}>
                            <h3 style={{margin:0}}>📂 Materiale și Resurse</h3>
                            <span style={{background:'#e0f2fe', color:'#0284c7', padding:'2px 8px', borderRadius:'10px', fontSize:'0.8rem', fontWeight:'600'}}>
                                {event.materials.length}
                            </span>
                         </div>
                         <div className="divider-line"></div>
                         
                         <div className="materials-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', marginTop: '20px' }}>
                             {event.materials.map((mat, index) => (
                                 <a 
                                    key={mat.id || index} 
                                    href={mat.url || mat.fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        padding: '15px', 
                                        backgroundColor: '#fff', 
                                        border: '1px solid #e5e7eb', 
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        color: '#374151',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                    }}
                                 >
                                    <div style={{
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                        width:'40px', height:'40px', background:'#eff6ff', borderRadius:'8px', marginRight:'12px', color:'#2563eb'
                                    }}>
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                    <div style={{overflow:'hidden'}}>
                                        <div style={{ fontWeight: '600', fontSize:'0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {mat.fileName || `Document ${index+1}`}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop:'2px' }}>
                                            Deschide document
                                        </div>
                                    </div>
                                 </a>
                             ))}
                         </div>
                    </div>
                </div>
            )}

          
            <div >
                <ReviewSection eventId={id} userRole={user.role} />
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