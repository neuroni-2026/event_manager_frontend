import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import TicketModal from './Ticket'; 
import Circle from '../Icons/circle.png'; 
import './Home.css'; 
import './MyTickets.css'; 
import { toast } from 'react-hot-toast';

const MyTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  

  const [user, setUser] = useState({ firstName: '', lastName: '', role: '' });

  const [debugData, setDebugData] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const pUser = JSON.parse(userData);
      const rawRole = pUser.roles && pUser.roles.length > 0 ? pUser.roles[0].toUpperCase() : 'USER';
      setUser({
        firstName: pUser.firstName,
        lastName: pUser.lastName,
        role: rawRole.replace('ROLE_', '')
      });
    }
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/tickets/my-tickets');
        setTickets(response.data);
        

        if (response.data && response.data.length > 0) {
            console.log("Ticket Data:", response.data[0]);
            setDebugData(response.data[0]);
        }
      } catch (error) {
        console.error("Eroare bilete:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);


  const parseDate = (dateInput) => {
      if (!dateInput) return null;

      

      if (Array.isArray(dateInput)) {

          return new Date(
              dateInput[0],      
              dateInput[1] - 1,
              dateInput[2],     
              dateInput[3] || 0,
              dateInput[4] || 0  
          );
      }

      
      return new Date(dateInput);
  };

  const formatTicketDate = (rawDate) => {
      const d = parseDate(rawDate);
      
      if (!d || isNaN(d.getTime())) {
          return { day: '??', month: '---' };
      }

      return {
          day: d.getDate(),
          month: d.toLocaleDateString('ro-RO', { month: 'short' }).toUpperCase()
      };
  };

  return (
    <div className="home-container">
      
      <div className="Header">
        <h1>Portofelul Meu</h1>
        <div className="user-info">
            <button className="wallet-icon-btn" onClick={() => navigate('/home')} title="Înapoi la Home">
                 Home
            </button>
            <div className="user-text">
                <span className="user-role">{user.role}</span>
                <span className="user-name">{user.firstName} {user.lastName}</span>
            </div>
            <img src={Circle} alt="Profile" className="circle-icon"/>
        </div>
      </div>

      <div className="grid-container" style={{marginTop:'20px'}}>
        {loading ? <p style={{color:'white'}}>Se încarcă biletele...</p> : (
            <div className="tickets-grid">
               {tickets.length === 0 ? (
                   <p style={{color:'white'}}>Nu ai cumparat niciun bilet inca.</p>
               ) : (
                   tickets.map(ticket => {

                       const dateField = ticket.eventStartTime || ticket.eventDate || ticket.date || ticket.startTime;
                       
                       const { day, month } = formatTicketDate(dateField);
                       
                       return (
                        <div key={ticket.id} className="mini-ticket-card" onClick={() => setSelectedTicket(ticket)}>
                            <div className="mini-header">
                                <span className="mini-date">
                                    <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{day}</span>
                                    <br/>
                                    <span style={{textTransform: 'uppercase'}}>{month}</span>
                                </span>
                            </div>
                            <div className="mini-body">
                                <h4>{ticket.eventTitle || ticket.title || "Eveniment"}</h4>
                                <p>📍 {ticket.eventLocation || ticket.location || "Online"}</p>
                                <button className="btn-view">Vezi QR</button>
                            </div>
                        </div>
                       );
                   })
               )}
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