import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../services/api';
import './NotificationBell.css';
import { toast } from 'react-hot-toast'; 

const NotificationBell = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
       
        const response = await api.get('/notifications');
       
        if (Array.isArray(response.data)) {
             setNotificationsCount(response.data.length);
        } else {
           
             console.warn("Format notificări neașteptat", response.data);
             setNotificationsCount(0);
        }

      } catch (error) {
        console.error("Eroare notificare:", error);
      }
    };

    fetchCount();
    
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const setNotificationsCount = (count) => {
      setUnreadCount(count);
  }

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