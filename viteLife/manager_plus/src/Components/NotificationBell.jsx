import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../services/api';
import './NotificationBell.css';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await api.get('/notifications');
        setNotificationsCount(response.data.length); 
      } catch (error) {
        console.error("Eroare notif:", error);
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
      <button className="bell-icon">🔔</button>

      {unreadCount > 0 && (
        <span className="badge-count">{unreadCount}</span>
      )}
    </div>
  );
};

export default NotificationBell;