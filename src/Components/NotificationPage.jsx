import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './NotificationPage.css';
import { toast } from 'react-hot-toast';
import { FaChevronDown, FaArrowLeft } from 'react-icons/fa';

const NotificationPage = () => {
  const navigate = useNavigate(); 
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
     
        const sorted = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(sorted);
      } catch (error) {
        console.error("Eroare:", error);
        toast.error("Eroare la încărcare.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  
  const formatTimestamp = (isoStr) => {
      if (!isoStr) return '';
      const date = new Date(isoStr);
      const day = date.getDate();
      const month = date.toLocaleDateString('ro-RO', { month: 'short' }).replace('.', '');
      const time = date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
      return `${day} ${month} • ${time}`;
  };

  
  const getNotificationConfig = (message) => {
      const msg = message ? message.toLowerCase() : "";

      if (msg.includes('aprobat') || msg.includes('felicitări') || msg.includes('publicat')) {
          return { type: 'APPROVE', label: 'APROBAT' };
      }
      if (msg.includes('respins') || msg.includes('nu a fost aprobat') || msg.includes('reject')) {
          return { type: 'REJECT', label: 'RESPINS' };
      }
      if (msg.includes('anulat') || msg.includes('cancelled')) {
          return { type: 'CANCEL', label: 'ANULAT' };
      }
      if (msg.includes('locația') || msg.includes('location')) {
          return { type: 'LOCATION', label: 'LOCAȚIE SCHIMBATĂ' };
      }
      if (msg.includes('ora') || msg.includes('data') || msg.includes('amânat')) {
          return { type: 'TIME', label: 'ORĂ SCHIMBATĂ' };
      }
      return { type: 'INFO', label: 'INFO' };
  };


  const handleMarkAllRead = async () => {
      try {
     
          const updatePromises = notifications
            .filter(n => !n.isRead) 
            .map(notif => api.put(`/notifications/${notif.id}/read`, {}));
          
          await Promise.all(updatePromises);

         
          window.dispatchEvent(new Event('notificationsRead'));

       
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

          toast.success("Toate notificările au fost marcate ca citite.");

      } catch (error) {
          console.error("Eroare la marcare:", error);
          
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
  };

 
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notification-page-container">
      
      
      <div className="notif-header-row">
        <div className="header-left-group">
            <button className="back-arrow-btn" onClick={() => navigate('/home')}>
                ←
            </button>
           <div className="title-group">
                <h1>Notificări</h1>
                <span className="subtitle-text">
                    {unreadCount > 0 ? `${unreadCount} notificări noi` : 'Nu ai notificări noi'}
                </span>
            </div>
        </div>
        
        
        {unreadCount > 0 && (
            <button className="mark-read-btn" onClick={handleMarkAllRead} style={{color:"black"}}>
                Marchează toate ca citite
            </button>
        )}
      </div>
       

      <div className="notification-list-styled">
        {loading ? (
          <p className="loading-text">Se încarcă notificările...</p>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => {
            const config = getNotificationConfig(notif.message);
            const cardClass = `styled-notif-card card-type-${config.type}`;

            return (
                <div key={notif.id} className={cardClass}>
                  
                  <div className="card-header-line">
                      <div className="header-left">
                          <span className={`tag-pill tag-${config.type}`}>{config.label}</span>
                    
                          <span className="notif-event-title">
                              {notif.event ? notif.event.title : (notif.eventTitle || "Notificare Sistem")}
                          </span>
                          
                          
                          {!notif.isRead && <span className="red-dot">●</span>}
                      </div>
                      
                      <div className="header-right">
                          <span className="notif-date">{formatTimestamp(notif.createdAt || notif.timestamp)}</span>
                          <FaChevronDown className="chevron-icon" />
                      </div>
                  </div>

                  <div className="card-body-text">
                      {notif.message}
                  </div>
                </div>
            );
          })
        ) : (
          <div className="empty-state">
              <p>Nu ai nicio notificare. 🔔</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;