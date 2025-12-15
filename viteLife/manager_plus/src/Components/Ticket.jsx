import React from 'react';
import './Ticket.css';
import QR from '../Images/qr_code.png';
import AppleWallet from '../Images/a_wallet.png';
import GoogleWallet from '../Images/g_wallet.png';

const TicketModal = ({ ticketData, onClose, onAddToWallet, isSaved }) => {
  if (!ticketData) return null;

  const { eventTitle, eventLocation, studentName } = ticketData;

  const rawDate = ticketData.eventStartTime || 
                  ticketData.startTime || 
                  ticketData.date || 
                  ticketData.eventDate;

  const parseDate = (d) => {
      if (!d) return null;
      if (Array.isArray(d)) {
          return new Date(d[0], (d[1] || 1) - 1, d[2], d[3] || 0, d[4] || 0);
      }
      return new Date(d);
  };

  let dateFormatted = '??.??.????';
  let timeFormatted = '--:--';

  const dateObj = parseDate(rawDate);
  
  if (dateObj && !isNaN(dateObj.getTime())) {
      dateFormatted = dateObj.toLocaleDateString('ro-RO');
      timeFormatted = dateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  }

  const handleWalletClick = () => {
    if (!isSaved && onAddToWallet) {
        onAddToWallet(); 
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="content" onClick={(e) => e.stopPropagation()}>
        
        <div className="header">
          <button className="buton-back" onClick={onClose}>‹ Back</button>
        </div>
        
        <h3 className="title">{eventTitle || "Bilet Fără Titlu"}</h3>
        
        <div className="qr-container">
          <img src={QR} alt="QR Code" className="qr-image" />
        </div>

        <div className="ticket-details">
          <p className="student-name">Deținător: <strong>{studentName || "Student"}</strong></p>
          <p className="event-info">
            {eventLocation || "Locație online"} • {dateFormatted} • {timeFormatted}
          </p>
          
          <div className="tags">
             <span className="tag-badge tag-green">VALID</span>
             <span className="tag-badge tag-yellow">TICKET</span>
          </div>
        </div>

        <div className="wallet-actions">
           {isSaved ? (
               <div className="saved-status" style={{textAlign: 'center', padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #2ecc71'}}>
                   <span style={{fontSize: '24px', display:'block'}}>✅</span>
                   <p style={{margin: '5px 0 0 0', fontWeight: 'bold', color: '#15803d'}}>
                       Bilet salvat în portofel
                   </p>
               </div>
           ) : (
               <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                   <img 
                      src={AppleWallet} 
                      alt="Add to Apple Wallet" 
                      className="wallet-buton" 
                      onClick={handleWalletClick}
                      style={{cursor: 'pointer', height: '45px'}}
                   />
                   <img 
                      src={GoogleWallet} 
                      alt="Add to Google Wallet" 
                      className="wallet-buton" 
                      onClick={handleWalletClick}
                      style={{cursor: 'pointer', height: '45px'}}
                   />
               </div>
           )}
        </div>

        <button className="buton-export">
          EXPORT IN PDF
        </button>

        

      </div>
    </div>
  );
};

export default TicketModal;