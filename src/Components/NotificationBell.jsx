import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../services/api';
import './NotificationBell.css';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = async () => {
    try {
     
      
      const response = await api.get('/notifications/count');
      setUnreadCount(response.data);

 

    } catch (error) {
      console.error("Eroare notificare:", error);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000); 

  
    const handleNotificationsRead = () => {
        setUnreadCount(0); 
    };

    window.addEventListener('notificationsRead', handleNotificationsRead);

    return () => {
        clearInterval(interval);
        window.removeEventListener('notificationsRead', handleNotificationsRead);
    };
  }, []);

  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <div 
        className="bell-wrapper" 
        onClick={handleClick} 
        title="Vezi notificarile"
    >
      <button className="bell-btn-styled">
        <span className="bell-icon">🔔</span> Notificari
      </button>

      {unreadCount > 0 && (
        <span className="badge-count">{unreadCount}</span>
      )}
    </div>
  );
};

export default NotificationBell;