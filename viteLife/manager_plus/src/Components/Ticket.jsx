import React from 'react';
import './Ticket.css';
import QR from '../Images/qr_code.png';
import AppleWallet from '../Images/a_wallet.png';
import GoogleWallet from '../Images/g_wallet.png';

// [NOU] Primim prop-ul 'isSaved'
const TicketModal = ({ ticketData, onClose, onAddToWallet, isSaved }) => {
  if (!ticketData) return null;

  const { eventTitle, eventLocation, eventStartTime, studentName, qrCode } = ticketData;

  const dateObj = new Date(eventStartTime);
  const dateFormatted = dateObj.toLocaleDateString('ro-RO');
  const timeFormatted = dateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

  const handleWalletClick = () => {
    // Apelăm logica doar dacă nu e deja salvat (deși butoanele vor fi ascunse oricum)
    if (!isSaved && onAddToWallet) {
        onAddToWallet(); 
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="content" onClick={(e) => e.stopPropagation()}>
        
        <div className="header">
          <button className="buton-back" onClick={onClose}>‹ Back</button>
          <h3 className="title">{eventTitle}</h3>
        </div>

        <div className="qr-container">
          <img src={QR} alt="QR Code" className="qr-image" />
        </div>

        <div className="ticket-details">
          <p className="student-name">Deținător: <strong>{studentName}</strong></p>
          <p className="event-info">
            {eventLocation} • {dateFormatted} • {timeFormatted}
          </p>
          
          <div className="tags">
             <span className="tag-badge tag-green">VALID</span>
             <span className="tag-badge tag-yellow">TICKET</span>
          </div>
        </div>

        {/* --- LOGICA DE DEZACTIVARE --- */}
        <div className="wallet-actions">
           
           {isSaved ? (
               // CAZ 1: DEJA SALVAT -> Afișăm un mesaj static
               <div className="saved-status">
                   <span style={{fontSize: '20px'}}>✅</span>
                   <p>Bilet salvat în portofel</p>
               </div>
           ) : (
               // CAZ 2: NU E SALVAT -> Afișăm butoanele active
               <>
                   <img 
                      src={AppleWallet} 
                      alt="Add to Apple Wallet" 
                      className="wallet-buton" 
                      onClick={handleWalletClick}
                      style={{cursor: 'pointer'}}
                   />
                   <img 
                      src={GoogleWallet} 
                      alt="Add to Google Wallet" 
                      className="wallet-buton" 
                      onClick={handleWalletClick}
                      style={{cursor: 'pointer'}}
                   />
               </>
           )}
        </div>
        {/* ----------------------------- */}

        <button className="buton-export">
          EXPORT IN PDF
        </button>

      </div>
    </div>
  );
};

export default TicketModal;