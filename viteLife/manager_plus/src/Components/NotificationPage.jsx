import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './NotificationPage.css';
import Circle from '../Icons/circle.png';


const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    role: ''
  });


  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser({
        firstName: parsedUser.firstName || 'FIESC',
        lastName: parsedUser.lastName || 'NEURONII PLUS',
        role: parsedUser.roles?.[0]?.toUpperCase() || ''
      });
    }
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error("Eroare la încărcarea notificărilor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="notification-page-container">
      <div className="Header">
             <h1>Event Manager</h1>
             
             <div className="user-info">
               <p className="user-name">
                 {user.firstName} {user.lastName} <br/>
                   {user.role}
               </p>
               <img src={Circle} alt="circle" className="circle-icon"/>
             </div>
           </div>

      <div className="notification-list">
        {loading ? (
          <p>Se încarcă notificările...</p>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <div key={notif.id} className="notification-card">
              <div className="card-header-row">
                <span className="event-title-notif">{notif.eventTitle || "Eveniment"}</span>
                {notif.type && <span className="notification-type-badge">{notif.type}</span>}
              </div>
              <p className="notification-message">{notif.message}</p>
            </div>
          ))
        ) : (
          <>
            <div className="notification-card empty-placeholder"></div>
            <div className="notification-card empty-placeholder"></div>
            <div className="notification-card empty-placeholder"></div>
            <div className="notification-card empty-placeholder"></div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;