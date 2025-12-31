import React from 'react';
import './Ticket.css';
import QR from '../Images/qr_code.png';

import AppleWallet from '../Images/a_wallet.png';
import GoogleWallet from '../Images/g_wallet.png';

const TicketModal = ({ ticketData, onClose, onAddToWallet, isSaved }) => {
  if (!ticketData) return null;

  const { eventTitle, eventLocation, studentName, id } = ticketData;

  const parseDate = (d) => {
      if (!d) return null;
      if (Array.isArray(d)) return new Date(d[0], (d[1]||1)-1, d[2], d[3]||0, d[4]||0);
      return new Date(d);
  };

  const rawDate = ticketData.eventStartTime || ticketData.startTime || ticketData.date || ticketData.eventDate;
  const dateObj = parseDate(rawDate);
  
  const dateString = dateObj ? dateObj.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Data necunoscută';
  const timeString = dateObj ? dateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) : '--:--';
  const purchaseDate = ticketData.purchaseDate ? parseDate(ticketData.purchaseDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : "2 decembrie 2025";
  const ticketIdDisplay = `TICKET-00${id || 'X'}-ASSIST-2025`;

  const handleWalletClick = () => {
    if (onAddToWallet) onAddToWallet();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ticket-card-modal" onClick={(e) => e.stopPropagation()}>
        
  
        <div className="modal-header-section">
            <button className="close-x-btn" onClick={onClose}>✕</button>
            <h2 className="main-heading">Biletul tău</h2>
            <p className="sub-heading">{eventTitle || "Eveniment"}</p>
        </div>

     
        <div className="qr-section-wrapper">
            <div className="qr-box">
                <img src={QR} alt="QR Code" className="qr-img" />
            </div>
        </div>

     
        <div className="dashed-separator"></div>

        
        <div className="details-list">
            <div className="detail-item">
                <div className="icon-col">📅</div>
                <div className="info-col">
                    <span className="label">Data și ora</span>
                    <span className="value-primary">{dateString}</span>
                    <span className="value-secondary">{timeString}</span>
                </div>
            </div>

            <div className="detail-item">
                <div className="icon-col">📍</div>
                <div className="info-col">
                    <span className="label">Locație</span>
                    <span className="value-primary">{eventLocation || "Online"}</span>
                </div>
            </div>

            <div className="detail-item">
                <div className="icon-col">👤</div>
                <div className="info-col">
                    <span className="label">Participant</span>
                    <span className="value-primary">{studentName || "Alex Student"}</span>
                </div>
            </div>

            <div className="detail-item">
                <div className="icon-col">🎫</div>
                <div className="info-col">
                    <span className="label">ID Bilet</span>
                    <span className="value-primary ticket-id-text">{ticketIdDisplay}</span>
                </div>
            </div>

            <div className="detail-item">
                <div className="icon-col">📅</div>
                <div className="info-col">
                    <span className="label">Data achiziției</span>
                    <span className="value-primary">{purchaseDate}</span>
                </div>
            </div>
        </div>

        
        <div className="modal-footer-section">
            
           
            {!isSaved && (
                <div className="wallet-actions-wrapper">
                    <p className="wallet-label">Adaugă în portofel:</p>
                    <div className="wallet-buttons-row">
                        <img 
                            src={AppleWallet} 
                            alt="Apple Wallet" 
                            className="wallet-img-btn"
                            onClick={handleWalletClick}
                        />
                        <img 
                            src={GoogleWallet} 
                            alt="Google Wallet" 
                            className="wallet-img-btn"
                            onClick={handleWalletClick}
                        />
                    </div>
                </div>
            )}

           
            {isSaved && (
                <div className="saved-success-msg">
                    ✅ Bilet salvat în portofel
                </div>
            )}

            <button className="download-pdf-btn">
                <span className="btn-icon">📥</span> Descarcă PDF
            </button>
            <p className="footer-note">Arată acest cod QR la intrarea în eveniment</p>
        </div>

      </div>
    </div>
  );
};

export default TicketModal;