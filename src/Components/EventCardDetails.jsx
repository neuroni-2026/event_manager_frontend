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
           const foundTicket = myTicketsRes.data.find(t => t.eventTitle === eventRes.data.title);
           
           if (foundTicket) {
             setCurrentTicket(foundTicket);
             const isWalletAdded = localStorage.getItem(`wallet_added_${id}`);
             setHasTicket(isWalletAdded === 'true'); 
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
               <button className="circle-btn back-btn" onClick={() => navigate(-1)} style={{background:"white", color:"black"}}>
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
                    <div className="divider-line"></div>
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
                    <button className="big-action-btn btn-red" onClick={handleBuyTicket}>
                        Participă
                    </button>
                )}
            </div>

       
            <div className="reviews-section-container">
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
          />
      )}
    </div>
  );
};

export default EventDetails;