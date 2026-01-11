import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, ArrowRight, CheckCircle, Info } from 'lucide-react';
import api from '../services/api';
import './NotificationBell.css';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // --- FUNȚIE TIMP RELATIV (Adaptată pentru createdAt) ---
  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (isNaN(seconds)) return "";
    if (seconds < 60) return 'chiar acum';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `acum ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `acum ${hours} ${hours === 1 ? 'oră' : 'ore'}`;
    const days = Math.floor(hours / 24);
    return `acum ${days} ${days === 1 ? 'zi' : 'zile'}`;
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      const data = Array.isArray(response.data) ? response.data : [];
      
      // IMPORTANT: Folosim "createdAt" pentru sortare, nu "timestamp"
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      console.log("Notificări primite în dropdown:", sortedData); // Pentru debug
      setNotifications(sortedData);
    } catch (err) {
      console.error("Eroare la încărcarea notificărilor:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notif-bell-container" ref={dropdownRef}>
      <button className="bell-trigger" onClick={() => setIsOpen(!isOpen)}>
        <Bell size={24} />
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <div className="header-top">
              <h3>Notificări</h3>
              <div className="header-actions">
                <button className="btn-all-notif"><Check size={16}/> Tot</button>
                <button className="btn-close-notif" onClick={() => setIsOpen(false)}><X size={18}/></button>
              </div>
            </div>
            <p className="unread-text">
                {unreadCount > 0 ? `Ai ${unreadCount} mesaje necitite` : 'Nu ai mesaje necitite'}
            </p>
          </div>

          <div className="notif-dropdown-list">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map(notif => (
                <div key={notif.id} className={`notif-dropdown-item ${!notif.isRead ? 'unread' : ''}`}>
                  {/* Mapare icoană în funcție de TYPE din JSON: EVENT_APPROVED sau INFO */}
                  <div className={`notif-icon-circle ${notif.type === 'EVENT_APPROVED' ? 'green' : 'blue'}`}>
                    {notif.type === 'EVENT_APPROVED' ? <CheckCircle size={18}/> : <Info size={18}/>}
                  </div>
                  
                  <div className="notif-item-content">
                    <p className="notif-msg">{notif.message}</p>
                    <span className="notif-time">● {getTimeAgo(notif.createdAt)}</span>
                  </div>
                  
                  {!notif.isRead && <div className="blue-dot-indicator"></div>}
                </div>
              ))
            ) : (
              <div className="empty-notif-msg">Nu ai notificări noi.</div>
            )}
          </div>

          <button className="see-all-history" onClick={() => { navigate('/notifications'); setIsOpen(false); }}>
            Vezi tot istoricul <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;