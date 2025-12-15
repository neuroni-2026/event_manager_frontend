import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './NotificationPage.css';
import Circle from '../Icons/circle.png';
import { toast } from 'react-hot-toast';
import './Home.css'; 

const NotificationPage = () => {
  const navigate = useNavigate(); 
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
      try {
        const parsedUser = JSON.parse(userData);
        const rawRole = parsedUser.roles && parsedUser.roles.length > 0 ? parsedUser.roles[0].toUpperCase() : 'USER';
        
        setUser({
          firstName: parsedUser.firstName || 'Student',
          lastName: parsedUser.lastName || 'USV',
          role: rawRole.replace('ROLE_', '') 
        });
      } catch (e) {
        console.error("Eroare parsing user", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error("Eroare la incarcarea notificarilor:", error);
        toast.error("Nu s-au putut incarca notificarile.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="notification-page-container">
      
      <div className="Header">
        <h1>Notificari</h1>
        <div className="user-info">
            <button className="wallet-icon-btn" onClick={() => navigate('/home')} title="Înapoi la Home">
                 Home
            </button>
            <div className="user-text">
                <span className="user-role">{user.role}</span>
                <span className="user-name">{user.firstName} {user.lastName}</span>
            </div>
            <img src={Circle} alt="Profile" className="circle-icon"/>
        </div>
      </div>

      <div className="notification-list">
        {loading ? (
          <p style={{color:'white', textAlign:'center', marginTop:'20px'}}>Se incarca notificarile...</p>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <div key={notif.id} className="notification-card">
              <div className="card-header-row">
                <span className="event-title-notif">{notif.eventTitle || "Sistem"}</span>
                {notif.type && <span className="notification-type-badge">{notif.type}</span>}
              </div>
              <p className="notification-message">{notif.message}</p>
              {notif.timestamp && (
                  <span className="notification-date">
                      {new Date(notif.timestamp).toLocaleString('ro-RO')}
                  </span>
              )}
            </div>
          ))
        ) : (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginTop:'50px'}}>
             <p style={{color:'#ccc'}}>Nu ai nicio notificare noua. 🔔</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;