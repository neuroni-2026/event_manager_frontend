import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './NotificationPage.css';
import { CheckCheck, Info, Check, Filter, ArrowLeft, MapPin, Clock, AlertTriangle, XCircle, BellRing } from 'lucide-react';
import { toast } from 'react-hot-toast';

const NotificationPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('Toate');
  const [loading, setLoading] = useState(true);

  // --- LOGICĂ TIMP REAL ---
  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'chiar acum';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `acum ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `acum ${hours} ore`;
    const days = Math.floor(hours / 24);
    return `acum ${days} zile`;
  };

  // --- CONFIGURARE STILURI PER TIP ---
  const getNotifStyle = (type) => {
    switch (type) {
      case 'EVENT_APPROVED': 
        return { icon: <CheckCheck size={28}/>, color: '#22c55e', bg: '#f0fdf4', label: 'EVENT APPROVED' };
      case 'EVENT_REJECTED': 
        return { icon: <XCircle size={28}/>, color: '#ef4444', bg: '#fef2f2', label: 'REJECTED' };
      case 'LOCATION_CHANGED': 
        return { icon: <MapPin size={28}/>, color: '#f59e0b', bg: '#fffbeb', label: 'LOCATION' };
      case 'TIME_CHANGED': 
      case 'DATE_CHANGED': 
        return { icon: <Clock size={28}/>, color: '#3b82f6', bg: '#eff6ff', label: 'SCHEDULE' };
      case 'CANCELLED': 
        return { icon: <AlertTriangle size={28}/>, color: '#ef4444', bg: '#fef2f2', label: 'CANCELLED' };
      case 'REMINDER': 
        return { icon: <BellRing size={28}/>, color: '#8b5cf6', bg: '#f5f3ff', label: 'REMINDER' };
      default: 
        return { icon: <Info size={28}/>, color: '#3b82f6', bg: '#eff6ff', label: 'INFO' };
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      const sortedData = (res.data || []).sort((a, b) => 
        new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp)
      );
      setNotifications(sortedData);
    } catch (err) {
      toast.error("Eroare la încărcarea notificărilor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      toast.error("Nu s-a putut marca notificarea.");
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("Toate marcate ca citite.");
    } catch (err) { 
      toast.error("Eroare la procesarea cererii.");
    }
  };

  const filtered = notifications.filter(n => activeTab === 'Toate' ? true : !n.isRead);

  return (
    <div className="page-notif-container">
      <div className="page-notif-header">
        <div className="header-left">
          <button className="btn-back-home" onClick={() => navigate('/home')}><ArrowLeft size={24}/></button>
          <div className="header-titles">
            <h1 style={{color:'black', textAlign: 'left', margin: 0}}>Notificări</h1>
            <p style={{textAlign: 'left', color: '#64748b'}}>Gestionează alertele și actualizările contului tău.</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button className="btn-mark-read-all" onClick={handleMarkAllRead} style={{color:'black'}}> 
            <Check size={18}/> Marchează tot ca citit
          </button>
        )}
      </div>

      <div className="notif-filters-bar">
        <div className="notif-tabs" style={{width:'100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', gap: '10px'}}>
            <button className={`tab-item ${activeTab === 'Toate' ? 'active' : ''}`} onClick={() => setActiveTab('Toate')}>
              Toate
            </button>
            <button className={`tab-item ${activeTab === 'Necitite' ? 'active' : ''}`} onClick={() => setActiveTab('Necitite')}>
              Necitite <span className="unread-badge-pill">{unreadCount}</span>
            </button>
          </div>
          <button className="btn-filter-notif"><Filter size={16}/> FILTREAZĂ</button>
        </div>
      </div>

      <div className="notif-list-cards">
        {loading ? (
            <p>Se încarcă...</p>
        ) : filtered.length > 0 ? (
          filtered.map((notif, index) => {
            // DECLARAȚIA VARIABILEI STYLE ESTE ESENȚIALĂ AICI
            const style = getNotifStyle(notif.type);

            return (
              <div key={notif.id} className={`notif-full-card ${notif.type}`} style={{position: 'relative', display: 'flex', flexDirection: 'column'}}>
                
              
                <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start'}}>
                  {/* ICONIȚA DINAMICĂ */}
                  <div 
                    className={`card-icon-wrap icon-${notif.type}`} 
                    style={{ 
                      width: '56px', height: '56px', borderRadius: '18px', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      flexShrink: 0, backgroundColor: style.bg, color: style.color 
                    }}
                  >
                    {style.icon}
                  </div>
                  
                  <div className="card-content-wrap" style={{textAlign: 'left', flex: 1}}>
                    <div className="card-header-row">
                      <span 
                        className={`card-label-tag tag-${notif.type}`} 
                        style={{
                            color: 'black', 
                            fontSize: '11px', fontWeight: '900',
                            border: index === 0 ? '1px solid #3b82f6' : 'none',
                            padding: index === 0 ? '4px 8px' : '0',
                            borderRadius: '10px'
                        }}
                      >
                        {style.label}
                      </span>
                      <span className="card-timestamp">● {getTimeAgo(notif.createdAt || notif.timestamp)}</span>
                    </div>
                    <h3 className="card-msg-text" style={{color: 'black', margin: '5px 0 10px', fontSize: '18px'}}>{notif.message}</h3>
                    
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        {!notif.isRead ? (
                        <button 
                            className="btn-card-read" 
                            style={{color:"black", cursor: 'pointer'}} 
                            onClick={() => handleMarkAsRead(notif.id)}
                        >
                            Marchează ca citit
                        </button>
                        ) : (
                        <div style={{
                            border:'1px solid #7deb84', color:'#166534', borderRadius:'10px', 
                            width:'70px', backgroundColor:'#f0fdf4', padding:'2px 5px',
                            display:'flex', alignItems:'center', gap: '4px', fontSize: '12px', fontWeight: '700'
                        }}>
                            <CheckCheck size={14}/>Citit
                        </div>
                        )}
                    </div>
                  </div>
                </div>
                {!notif.isRead && <div className="card-blue-indicator" style={{position: 'absolute', top: '25px', right: '25px'}}></div>}
              </div>
            );
          })
        ) : (
          <div className="notif-empty-state" style={{color:'black', padding: '40px'}}>Nu ai notificări noi.</div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;