import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import TicketModal from './Ticket'; 
import './MyTickets.css'; 
import { toast } from 'react-hot-toast';
import DefaultImage from '../Images/usv.jpg'; 

const MyTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/tickets/my-tickets');
        setTickets(response.data);
      } catch (error) {
        console.error("Eroare bilete:", error);
        toast.error("Nu s-au putut încărca biletele.");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  
  const formatDate = (dateInput) => {
      if (!dateInput) return "Data necunoscută";
      let d;
      if (Array.isArray(dateInput)) {
           d = new Date(dateInput[0], dateInput[1]-1, dateInput[2], dateInput[3]||0, dateInput[4]||0);
      } else {
           d = new Date(dateInput);
      }
      
      if (isNaN(d.getTime())) return "Invalid Date";

      return d.toLocaleDateString('ro-RO', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
      });
  };

  
  const formatTime = (dateInput) => {
      if (!dateInput) return "--:--";
      let d;
      if (Array.isArray(dateInput)) {
           d = new Date(dateInput[0], dateInput[1]-1, dateInput[2], dateInput[3]||0, dateInput[4]||0);
      } else {
           d = new Date(dateInput);
      }
      return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="my-tickets-container">
      
     
      <div className="tickets-header-simple">
          <button className="back-arrow" onClick={() => navigate('/home')}>←</button>
          <div className="header-texts">
              <h1 style={{fontWeight:"300", fontSize:"20px"}}>My Tickets</h1>
              <p>Vezi și gestionează biletele tale la evenimente</p>
          </div>
      </div>

    
      <div className="tickets-list-section">
        {loading ? (
            <p className="loading-msg">Se încarcă...</p>
        ) : tickets.length === 0 ? (
            <p className="empty-msg">Nu ai cumpărat niciun bilet încă.</p>
        ) : (
            <div className="tickets-cards-grid">
                {tickets.map(ticket => {
                    
                    const dateVal = ticket.eventStartTime || ticket.eventDate || ticket.date;
                    const imageUrl = ticket.eventImageUrl || ticket.imageUrl || DefaultImage;

                    return (
                        <div key={ticket.id} className="ticket-visual-card">
                            
                       
                            <div className="ticket-img-wrapper">
                                <img 
                                    src={imageUrl} 
                                    alt={ticket.eventTitle} 
                                    onError={(e)=>{e.target.src=DefaultImage}}
                                />
                            </div>

                         
                            <div className="ticket-content">
                                <h3 className="ticket-title">
                                    {ticket.eventTitle || "Eveniment Fără Titlu"}
                                </h3>

                                <div className="ticket-details-list">
                                    <div className="detail-row">
                                        <span className="icon-red">📅</span>
                                        <span>{formatDate(dateVal)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="icon-red">⏰</span>
                                        <span>{formatTime(dateVal)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="icon-red">📍</span>
                                        <span>{ticket.eventLocation || "Online"}</span>
                                    </div>
                                </div>
                            </div>

                            
                            <button 
                                className="view-ticket-btn" 
                                onClick={() => setSelectedTicket(ticket)}
                            >
                                Vezi bilet
                            </button>
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      
      {selectedTicket && (
          <TicketModal 
             ticketData={selectedTicket} 
             onClose={() => setSelectedTicket(null)} 
          />
      )}
    </div>
  );
};

export default MyTickets;