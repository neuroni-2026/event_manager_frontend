import React from 'react';
import './Ticket.css';
import QR from '../Images/qr_code.png';
import AppleWallet from '../Images/a_wallet.png';
import GoogleWallet from '../Images/g_wallet.png';

const TicketModal = ({ ticketData, onClose, onAddToWallet, isSaved, hideWallet }) => {
  if (!ticketData) return null;

  const { eventTitle, eventLocation, studentName, id } = ticketData;

  const parseDate = (d) => {
    if (!d) return null;
    if (Array.isArray(d)) return new Date(d[0], (d[1] || 1) - 1, d[2], d[3] || 0, d[4] || 0);
    return new Date(d);
  };

  const rawDate = ticketData.eventStartTime || ticketData.startTime || ticketData.date || ticketData.eventDate;
  const dateObj = parseDate(rawDate);
  const dateString = dateObj ? dateObj.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Data necunoscută';
  const timeString = dateObj ? dateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) : '--:--';
  const purchaseDate = ticketData.purchaseDate ? parseDate(ticketData.purchaseDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : "8 ianuarie 2026";
  const ticketIdDisplay = ticketData.ticketId || `6-10-${id || 'dc2'}a4da3-918f-4e8e-9f01-98ab49dba2c8`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ticket-card-modern" onClick={(e) => e.stopPropagation()}>
        
   
        <div className="ticket-header-gradient">
          <button className="back-arrow-btn" onClick={onClose} >← Inapoi</button>
          <div className="valid-badge">
            <span className="check-icon">✓</span> BILET VALID
          </div>
          <h1 className="ticket-event-title">{eventTitle}</h1>
          <p className="ticket-id-subtitle">ID: #{id || '6-10-dc2'}</p>
        </div>

     
        <div className="qr-container-modern">
          <div className="qr-wrapper">
            <img src={QR} alt="QR Code" />
          </div>
          <p className="scan-text">SCANEAZĂ LA INTRARE</p>
        </div>

       


        <div className="ticket-details-modern">
          <div className="detail-item-modern">
            <div className="icon-circle blue-bg">📅</div>
            <div className="detail-text">
              <label>DATA ȘI ORA</label>
              <p>{dateString}</p>
              <span>{timeString}</span>
            </div>
          </div>

          <div className="detail-item-modern">
            <div className="icon-circle light-blue-bg">📍</div>
            <div className="detail-text">
              <label>LOCAȚIE</label>
              <p>{eventLocation || "Sala D01"}</p>
            </div>
          </div>

          <div className="detail-item-modern">
            <div className="icon-circle peach-bg">👤</div>
            <div className="detail-text">
              <label>PARTICIPANT</label>
              <p>{studentName || "stud5 stud5"}</p>
            </div>
          </div>

          <div className="detail-item-modern">
            <div className="icon-circle yellow-bg">🎫</div>
            <div className="detail-text">
              <label>ID BILET</label>
              <p className="ticket-id-long">{ticketIdDisplay}</p>
            </div>
          </div>

          <div className="detail-item-modern">
            <div className="icon-circle grey-bg">🕒</div>
            <div className="detail-text">
              <label>DATA PROCURĂRII</label>
              <p>{purchaseDate}</p>
            </div>
          </div>
        </div>

    
        <div className="ticket-footer-modern">
          
          {!hideWallet && !isSaved && (
            <div className="wallet-section-modern">
              <p>Salvează în portofel</p>
              <div className="wallet-row">
                <img src={AppleWallet} alt="Apple" onClick={onAddToWallet} />
                <img src={GoogleWallet} alt="Google" onClick={onAddToWallet} />
              </div>
            </div>
          )}

          {isSaved && !hideWallet && (
            <div className="saved-msg-modern">✅ Salvat în portofel</div>
          )}

          <div className="action-buttons-row">
            <button className="btn-pdf">
              <span>📥</span> PDF
            </button>
            <button className="btn-print">
              <span>🖨️</span> Print
            </button>
          </div>
          <p className="bottom-note">ARATĂ CODUL LA INTRARE</p>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;