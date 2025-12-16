import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import TicketModal from './Ticket';
import ReviewSection from './ReviewSection';
import './EventCardDetails.css';
import usv from '../Images/usv.jpg';
import Circle from '../Icons/circle.png';
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
           } catch (e) { console.error("Eroare check fav:", e); }

           const myTicketsRes = await api.get('/tickets/my-tickets');
           const foundTicket = myTicketsRes.data.find(t => t.eventTitle === eventRes.data.title);
           
           if (foundTicket) {
             setCurrentTicket(foundTicket);


             const isWalletAdded = localStorage.getItem(`wallet_added_${id}`);
             
             if (isWalletAdded === 'true') {
                 setHasTicket(true); 
             } else {
                 setHasTicket(false); 
             }
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          
          toast.success('Bilet salvat!', {
              duration: 3000,
              style: { border: '1px solid #2ecc71', padding: '16px', color: '#15803d', background: '#f0fdf4'},
              iconTheme: { primary: '#2ecc71', secondary: '#fff' },
          });

      } catch (error) {
          console.error(error);
          toast.error('Eroare: Nu s-a putut salva biletul.');
      }
  };

  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('ro-RO') : "-";
  const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString('ro-RO', {hour:'2-digit', minute:'2-digit'}) : "-";
  const formatDeadline = (iso) => iso ? `${formatTime(iso)} ${formatDate(iso)}` : "-";

  if (loading) return <div className="loading-screen">Se incarca...</div>;
  if (!event) return <div className="error-screen">Eveniment inexistent.</div>;

  return (
    <div className="event-pagina">
      <div className="Header">
         <h1>Event Manager</h1>
         <div className="user-info">
             <button onClick={() => navigate('/home')} className="home-btn-details">Home</button>
            <div className="user-text">
                <span className="user-role">{user.role}</span>
                <span className="user-name">{user.firstName} {user.lastName}</span>
            </div>
            <img src={Circle} alt="icon" className="circle-icon"/>
         </div>
      </div>

      <div className="card-detalii">
         <div className="header">
            <button className="back" onClick={() => navigate(-1)}>&lt; Back</button>
            <h1 className="event-title">{event.title}</h1>
         </div>

         <div className="content-card">
            
            <div className="card-imagine" style={{position: 'relative'}}>
               <img 
                 src={event.imageUrl || usv} 
                 alt={event.title} 
                 className="event-imagine" 
                 onError={(e)=>{e.target.src=usv}}
               />

               {user.role === 'STUDENT' && (
                   <button 
                      className="fav-btn-details"
                      onClick={handleToggleFavorite}
                      title={isFavorite ? "Scoate de la favorite" : "Adauga la favorite"}
                   >
                      {isFavorite ? '❤️' : '🤍'}
                   </button>
               )}
            </div>

            <div className="info-panel">
               <div className="info-group"><label>Organizator:</label><div className="info-value">{event.organizer?.firstName} {event.organizer?.lastName}</div></div>
               <div className="info-group"><label>Locație:</label><div className="info-value">{event.location}</div></div>
               <div className="info-group"><label>Data:</label><div className="info-value">{formatDate(event.startTime)}</div></div>
               <div className="info-group"><label>Ora:</label><div className="info-value">{formatTime(event.startTime)}</div></div>
               <div className="info-group"><label>Deadline:</label><div className="info-value" style={{color: '#ff4757'}}>{formatDeadline(event.startTime)}</div></div>
                
               {hasTicket ? (
                   <button 
                       className="buton-participare buton-rezervat" 
                       onClick={handleOpenTicket} 
                       style={{backgroundColor: '#2ecc71', cursor: 'default'}}
                   >
                       ✅ REZERVAT
                   </button>
               ) : (
                   <button 
                       className="buton-participare" 
                       onClick={handleBuyTicket}
                   >
                       PARTICIP
                   </button>
               )}
            </div>
         </div>
         
         <div className="description">
            <h3>Descriere</h3>
            <p>{event.description || "Fara descriere."}</p>
         </div>

         <ReviewSection eventId={id} userRole={user.role} />
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