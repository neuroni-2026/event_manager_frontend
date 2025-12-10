import React from 'react';
import './Ticket.css';
import QR from '../Images/qr_code.png';
import AppleWallet from '../Images/a_wallet.png';
import GoogleWallet from '../Images/g_wallet.png';


const TicketModal = ({ event, onClose }) => {

 
  if (!event) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };


  const dateObj = new Date(event.startTime);
  const dateFormatted = dateObj.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeFormatted = dateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="overlay" onClick={onClose}>
      
      <div className="content" onClick={handleModalClick}>
        
        <div className="header">
          <button className="buton-back" onClick={onClose}>
             <span style={{marginRight: '4px'}}>‹</span> Back
          </button>
        
          <h3 className="title">{event.title}</h3>
        </div>

        <div className="qr-container">
           
          <img src={QR} alt="Event QR Code" className="qr-image" />
        </div>

        <div className="ticket-details">
        
          <p className="event-info">
            {event.location} • {dateFormatted} • {timeFormatted}
          </p>
          
          <div className="tags">
          
            <span className="tag-badge tag-green">USV</span>
            
            <span className="tag-badge tag-blue">
                {event.category || 'EVENT'}
            </span>
            
            <span className="tag-badge tag-yellow">TICKET</span>
          </div>
        </div>

        <div className="wallet-actions">
          <img src={AppleWallet} alt="Add to Apple Wallet" className="wallet-buton" />
          <img src={GoogleWallet} alt="Add to Google Wallet" className="wallet-buton" />
        </div>

        <button className="buton-export">
          EXPORT IN PDF
        </button>

      </div>
    </div>
  );
};

export default TicketModal;