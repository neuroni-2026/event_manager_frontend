import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import './EventCardDetails.css';
import usv from '../Images/usv.jpg';
import TicketModal from './Ticket';
import Circle from '../Icons/circle.png';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [hasTicket, setHasTicket] = useState(false); 
  const [currentTicket, setCurrentTicket] = useState(null); 
  const [showTicketModal, setShowTicketModal] = useState(false);
  
  const [user, setUser] = useState({ firstName: '', lastName: '', role: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const userData = localStorage.getItem('user');
        let currentUserRole = '';
        if (userData) {
           const pUser = JSON.parse(userData);
           const rawRole = pUser.roles && pUser.roles.length > 0 ? pUser.roles[0].toUpperCase() : 'GUEST';
           currentUserRole = rawRole.replace('ROLE_', '');
           setUser({
             firstName: pUser.firstName || 'Vizitator',
             lastName: pUser.lastName || '',
             role: currentUserRole
           });
        }

        const eventRes = await api.get(`/events/${id}`);
        setEvent(eventRes.data);

        if (currentUserRole === 'STUDENT') {
            try {
                const myTicketsRes = await api.get('/tickets/my-tickets');
                const foundTicket = myTicketsRes.data.find(t => t.eventTitle === eventRes.data.title);
                
                if (foundTicket) {
                    console.log("Bilet existent găsit (API).");
                    setCurrentTicket(foundTicket);

                    const isWalletAdded = localStorage.getItem(`wallet_added_${id}`);
                    
                    if (isWalletAdded === 'true') {
                        setHasTicket(true); 
                    } else {
                        setHasTicket(false); 
                    }
                }
            } catch (err) { console.warn("Check ticket failed"); }
        }

      } catch (error) {
        console.error("Eroare:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);


  const handleOpenTicket = () => {
      setShowTicketModal(true);
  };

 
  const handleBuyTicket = async () => {
    if (user.role !== 'STUDENT') {
        alert("Doar studenții pot participa!");
        return;
    }

    if (currentTicket) {
        console.log("Bilet deja existent. Deschid modal.");
        handleOpenTicket();
        return;
    }

    try {
        console.log("Cumpăr bilet nou...");
        const response = await api.post('/tickets', { eventId: id });
        
        const newTicket = response.data;
        setCurrentTicket(newTicket);
        setShowTicketModal(true);

    } catch (error) {
        if (error.response && error.response.status === 400) {
             try {
                 const myTickets = await api.get('/tickets/my-tickets');
                 const existingTicket = myTickets.data.find(t => t.eventTitle === event.title);
                 if (existingTicket) {
                     setCurrentTicket(existingTicket);
                     setShowTicketModal(true);
                 }
             } catch (e) { alert("Eroare recuperare bilet."); }
        } else {
             alert("Eroare: " + (error.response?.data?.message || "Eroare necunoscută."));
        }
    }
  };

  const handleTicketAddedToWallet = () => {
      setHasTicket(true); 
      
      localStorage.setItem(`wallet_added_${id}`, 'true');

      setShowTicketModal(false); 
      alert("Loc confirmat! Biletul a fost salvat.");
  };


  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('ro-RO') : "-";
  const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString('ro-RO', {hour:'2-digit', minute:'2-digit'}) : "-";
  const formatDeadline = (iso) => iso ? `${formatTime(iso)} ${formatDate(iso)}` : "-";

  if (loading) return <div style={{color:'white', padding:'50px'}}>Se încarcă...</div>;
  if (!event) return <div style={{color:'white', padding:'50px'}}>Eveniment inexistent.</div>;

  return (
    <div className="event-pagina">
      <div className="Header">
         <h1>Event Manager</h1>
         <div className="user-info">
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
            <div className="card-imagine">
               <img src={event.imageUrl || usv} alt={event.title} className="event-imagine" onError={(e)=>{e.target.src=usv}}/>
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
                       style={{backgroundColor: '#2ecc71'}}
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
            <p>{event.description || "Fără descriere."}</p>
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