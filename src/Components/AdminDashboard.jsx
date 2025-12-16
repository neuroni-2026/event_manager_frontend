import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { toast } from 'react-hot-toast';
import Circle from '../Icons/circle.png';
import './AdminDashboard.css';
import './Home.css'; 
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    role: ''
  });

  const fetchPendingEvents = async () => {
    try {
      const response = await api.get('/admin/pending-events');
      setPendingEvents(response.data);
    } catch (error) {
      console.error("Eroare la încărcare evenimente:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userDataStr = localStorage.getItem('user');
    
    if (userDataStr) {
      try {
        const parsedUser = JSON.parse(userDataStr);
        
        let displayRole = 'UTILIZATOR';
        if (parsedUser.roles && parsedUser.roles.length > 0) {
            displayRole = parsedUser.roles[0].replace('ROLE_', '');
        }

        setUser({
          firstName: parsedUser.firstName || 'User',
          lastName: parsedUser.lastName || '',
          role: displayRole
        });

        fetchPendingEvents();

      } catch (e) {
        console.error("Eroare la citirea datelor utilizatorului:", e);
        navigate('/login');
      }
    } else {
        navigate('/');
    }
  }, [navigate]);

  const handleApprove = async (eventId) => {
    try {
      await api.put(`/admin/approve/${eventId}`);
      setPendingEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
      toast.success('Eveniment aprobat!');
    } catch (error) {
      console.error("Eroare la aprobare:", error);
      toast.error('Nu s-a putut aproba evenimentul.');
    }
  };

const handleReject = async (eventId) => {
    
    const { value: reason } = await Swal.fire({
        title: 'Respinge Evenimentul',
        input: 'textarea', 
        inputLabel: 'Motivul respingerii',
        inputPlaceholder: 'Scrie aici de ce respingi evenimentul...',
        inputAttributes: {
            'aria-label': 'Scrie motivul respingerii'
        },
        showCancelButton: true,
        confirmButtonText: 'Respinge',
        cancelButtonText: 'Anulează',
        confirmButtonColor: '#d33', 
        cancelButtonColor: '#3085d6',
        inputValidator: (value) => {
            if (!value) {
                return 'Trebuie să scrii un motiv!';
            }
        }
    });

    
    if (!reason) return;

    try {
        
        await api.put(`/admin/reject/${eventId}`, null, {
            params: { reason: reason }
        });
        
        setPendingEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
        
       
        Swal.fire('Respins!', 'Evenimentul a fost respins și organizatorul notificat.', 'success');
        
    } catch (error) {
        console.error("Eroare la respingere:", error);
       
        toast.error("Eroare la respingere.");
    }
};

  if (loading) return <div className="admin-container loading">Se încarcă cererile...</div>;

  return (
    <div className="admin-container">
       <div className="Header">
           <h1>Event Manager</h1>
           
           <div className="user-info">
            <button 
                className="wallet-icon-btn"
                onClick={() => navigate(-1)} 
                title="Înapoi"
                style={{ border: 'none', cursor:'pointer', background:'black', color:'white', marginRight:'10px'}}
            >
                 Back
            </button>

             <div className="user-text">
                 <span className="user-role">{user.role}</span>
                 <span className="user-name">{user.firstName} {user.lastName}</span>
             </div>
             <img src={Circle} alt="icon" className="circle-icon"/>
           </div>
       </div>

      <header className="admin-header">
        <h1>Panou Administrator</h1>
        <p>
            {pendingEvents.length > 0 
                ? `Ai ${pendingEvents.length} evenimente care așteaptă aprobare.`
                : "Nu există cereri noi."}
        </p>
      </header>

      <div className="pending-list">
        {pendingEvents.length === 0 ? (
           <div className="empty-state">Totul este la zi!</div>
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
                        : "Fără descriere"}
                </p>
              </div>
              <div className="card-actions">
                <button className="buton-approve" onClick={() => handleApprove(event.id)}>
                    ✅ Aprobă
                </button>
                <button className="buton-reject" onClick={() => handleReject(event.id)}>
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