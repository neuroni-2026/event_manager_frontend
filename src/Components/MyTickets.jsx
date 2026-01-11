import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import TicketModal from './Ticket'; 
import './MyTickets.css'; 
import { toast } from 'react-hot-toast';
import { Ticket, ArrowRight, Calendar, MapPin } from 'lucide-react';
import QR from '../Images/qr_code.png';

const MyTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/tickets/my-tickets');
        setTickets(response.data);
      } catch (error) {
        toast.error("Eroare la încărcarea biletelor.");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const formatDate = (dateInput) => {
    const d = Array.isArray(dateInput) 
      ? new Date(dateInput[0], dateInput[1]-1, dateInput[2]) 
      : new Date(dateInput);
    return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateInput) => {
    const d = Array.isArray(dateInput) 
      ? new Date(dateInput[0], dateInput[1]-1, dateInput[2], dateInput[3]||0, dateInput[4]||0) 
      : new Date(dateInput);
    return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="mt-page-container">
      {/* Header Secțiune */}
      <div className="mt-header-row">
        <div className="mt-header-left">
          <div className="mt-icon-box">
            <Ticket size={28} color="white" />
          </div>
          <div className="mt-title-area">
            <h1>Portofel Bilete</h1>
            <p>Gestionează biletele tale digitale pentru evenimente.</p>
          </div>
        </div>
        
        {tickets.length > 0 && (
          <div className="mt-total-badge">
            Total: <b>{tickets.length} {tickets.length === 1 ? 'Bilet' : 'Bilete'}</b>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="mt-content-card">
        {loading ? (
          <div className="mt-loader">Se încarcă...</div>
        ) : tickets.length === 0 ? (
          <div className="mt-empty-state">
            <div className="mt-empty-circle">
              <Ticket size={48} color="#f05a28" />
            </div>
            <h2>Nu ai bilete încă</h2>
            <p>Nu ai achiziționat niciun bilet. Explorează evenimentele disponibile și rezervă-ți locul acum!</p>
            <button className="mt-explore-btn" onClick={() => navigate('/home')}>
              Explorează Evenimente <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="mt-tickets-grid">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="mt-ticket-visual">
                {/* Partea Stângă (Albă) */}
                <div className="mt-ticket-left">
                  <div className="mt-ticket-top">
                    <span className="mt-badge-valid">VALID</span>
                    <div className="mt-id-label">
                      ID BILET <br /> <span>#{ticket.id || '2-5-fc9e'}</span>
                    </div>
                  </div>

                  <h2 className="mt-ticket-title">{ticket.eventTitle || "Titlu Eveniment"}</h2>

                  <div className="mt-ticket-info">
                    <div className="mt-info-item">
                      <Calendar size={14} className="mt-info-icon" />
                      <div>
                        <label>DATA</label>
                        <strong>{formatDate(ticket.eventStartTime || ticket.date)}</strong>
                        <small>{formatTime(ticket.eventStartTime || ticket.date)}</small>
                      </div>
                    </div>
                    <div className="mt-info-item">
                      <MapPin size={14} className="mt-info-icon" />
                      <div>
                        <label>LOCAȚIE</label>
                        <strong>{ticket.eventLocation || "La facultate"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-ticket-footer">
                    <div className="mt-org-avatar">
                      {ticket.eventOrganizer?.charAt(0) || 'O'}
                    </div>
                    <span className="mt-org-name">{ticket.eventOrganizer || "Organizator"}</span>
                  </div>
                </div>

                {/* Divizorul cu crestături */}
                <div className="mt-ticket-divider">
                  <div className="mt-notch mt-notch-top"></div>
                  <div className="mt-dashed-line"></div>
                  <div className="mt-notch mt-notch-bottom"></div>
                </div>

                {/* Partea Dreaptă (Neagră) */}
                <div className="mt-ticket-right">
                  <div className="mt-qr-wrapper">
                    <img src={QR} alt="QR Code" />
                  </div>
                  <span className="mt-scan-label">SCAN ME</span>
                  <button className="mt-details-btn" onClick={() => setSelectedTicket(ticket)}>
                    Detalii <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTicket && (
        <TicketModal 
          ticketData={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
          hideWallet={true} 
        />
      )}
    </div>
  );
};

export default MyTickets;