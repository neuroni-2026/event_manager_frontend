import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchPendingEvents = async () => {
    try {
    
      const response = await api.get('/admin/pending-events');
      setPendingEvents(response.data);
    } catch (error) {
      console.error("Eroare admin:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);


  const handleApprove = async (eventId) => {
    try {
      await api.put('/admin/approve/${eventId}');
      
     
      setPendingEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
      
      alert("Eveniment aprobat cu succes! Evenimentul este vizibil pentru studenti.");
    } catch (error) {
      console.error("Eroare la aprobare:", error);
      alert("Nu s-a putut aproba evenimentul.");
    }
  };

  const handleReject = async (eventId) => {
      if(!window.confirm("Esti sigur ca vrei sa respingi acest eveniment?")) return;

      try {
          alert("Nu avem inca");
      } catch (error) {
          console.error(error);
      }
  };

  if (loading) return <div className="admin-container loading">Se încarcă cererile...</div>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Panou Administrator</h1>
        <p>
            {pendingEvents.length > 0 
                ? 'Ai ${pendingEvents.length} evenimente care asteapta aprobare.'
                : "Nu exista cereri noi."}
        </p>
      </header>

      <div className="pending-list">
        {pendingEvents.length === 0 ? (
           <div className="empty-state">🎉 Totul este la zi!</div>
        ) : (
          pendingEvents.map((event) => (
            <div key={event.id} className="pending-card">
              
              <div className="card-info">
                <span className="status-badge">PENDING</span>
                <h3>{event.title}</h3>
                
                <div className="details-grid">
                    <p><strong>Organizator:</strong> {event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : 'N/A'}</p>
                    <p><strong>Categorie:</strong> {event.category}</p>
                    <p><strong>Data:</strong> {new Date(event.startTime).toLocaleDateString('ro-RO')}</p>
                    <p><strong>Locație:</strong> {event.location}</p>
                </div>

                <p className="card-desc">
                    {event.description 
                        ? (event.description.length > 100 ? event.description.substring(0, 100) + '...' : event.description) 
                        : "Fara descriere"}
                </p>
              </div>
              
              <div className="card-actions">
                <button 
                    className="buton-approve" 
                    onClick={() => handleApprove(event.id)}
                >
                    ✅ Aprobă
                </button>

                <button 
                    className="buton-reject"
                    onClick={() => handleReject(event.id)}
                    style={{opacity: 0.7}} 
                >
                    ❌ Respinge
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;