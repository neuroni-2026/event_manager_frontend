import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TicketModal from './Ticket'; 
import './MyTickets.css'; 

const MyTickets = () => {
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
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="wallet-container">
      <h1>Portofelul Meu </h1>
      
      {loading ? <p>Se incarca biletele...</p> : (
        <div className="tickets-grid">
           {tickets.length === 0 ? (
               <p>Nu ai cumparat niciun bilet inca.</p>
           ) : (
               tickets.map(ticket => (
                   <div key={ticket.id} className="mini-ticket-card" onClick={() => setSelectedTicket(ticket)}>
                       <div className="mini-header">
                           <span className="mini-date">
                               {new Date(ticket.eventStartTime).getDate()} <br/>
                               {new Date(ticket.eventStartTime).toLocaleDateString('ro-RO', {month:'short'})}
                           </span>
                       </div>
                       <div className="mini-body">
                           <h4>{ticket.eventTitle}</h4>
                           <p>📍 {ticket.eventLocation}</p>
                           <button className="btn-view">Vezi QR</button>
                       </div>
                   </div>
               ))
           )}
        </div>
      )}

      
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