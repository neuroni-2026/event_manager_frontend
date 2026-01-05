import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { toast } from 'react-hot-toast';
import './AdminDashboard.css';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaCheck, FaTimes, FaEye, FaTrash } from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const [pendingEvents, setPendingEvents] = useState([]);
  const [publishedEvents, setPublishedEvents] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('events');

  
  const fetchAllEvents = async () => {
    setLoading(true);
    try {
    
      const [pendingRes, publishedRes] = await Promise.all([
        api.get('/admin/pending-events'),
        api.get('/events') 
      ]);

      setPendingEvents(pendingRes.data);
      setPublishedEvents(publishedRes.data);
      
    } catch (error) {
      console.error("Eroare la încărcare evenimente:", error);
      toast.error("Nu s-au putut încărca evenimentele.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const handleApprove = async (eventId) => {
    try {
      await api.put(`/admin/approve/${eventId}`);
      
      
      const approvedEvent = pendingEvents.find(e => e.id === eventId);
      
      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
      if (approvedEvent) {
        setPublishedEvents(prev => [...prev, { ...approvedEvent, status: 'published' }]);
      }
      
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
        showCancelButton: true,
        confirmButtonText: 'Respinge',
        cancelButtonText: 'Anulează',
        confirmButtonColor: '#ff4757', 
        inputValidator: (value) => {
            if (!value) return 'Trebuie să scrii un motiv!';
        }
    });

    if (!reason) return;

    try {
        const encodedReason = encodeURIComponent(reason);
        await api.put(`/admin/reject/${eventId}?reason=${encodedReason}`, null);
        setPendingEvents(prev => prev.filter(e => e.id !== eventId));
        Swal.fire('Respins!', 'Evenimentul a fost respins.', 'success');
    } catch (error) {
        console.error("Eroare:", error);
        toast.error("Eroare la respingere.");
    }
  };

  const handleDeletePublished = async (eventId) => {
    const result = await Swal.fire({
      title: 'Ești sigur?',
      text: "Evenimentul va fi șters definitiv!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Da, șterge-l!',
      cancelButtonText: 'Renunță'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/events/${eventId}`); 
        setPublishedEvents(prev => prev.filter(e => e.id !== eventId));
        Swal.fire('Șters!', 'Evenimentul a fost șters.', 'success');
      } catch (error) {
        console.error("Eroare la ștergere:", error);
        toast.error("Nu s-a putut șterge evenimentul.");
      }
    }
  };

  const handleViewDetails = (eventId) => {
      navigate(`/event_detalii/${eventId}`);
  };

  if (loading) return <div className="admin-loader">Se încarcă datele...</div>;

  return (
    <div className="admin-page">
       <div className="admin-content">
         <button onClick={() => navigate(-1)} className="back-btn">
               <FaArrowLeft /> 
           </button>
           <h1 className="admin-title">Panou Admin</h1>
           <p className="admin-subtitle">Gestionează evenimente, utilizatori și analize de sistem</p>

           <div className="admin-tabs">
               <button 
                 className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
                 onClick={() => setActiveTab('events')}
               >
                 Evenimente ({pendingEvents.length})
               </button>
               <button 
                 className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                 onClick={() => setActiveTab('users')}
               >
                 Utilizatori
               </button>
               <button 
                 className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                 onClick={() => setActiveTab('analytics')}
               >
                 Analize
               </button>
           </div>

          
           {activeTab === 'events' && (
               <div className="tab-content">
                   
                   <div className="section-block">
                       <h3 className="section-title">În așteptarea aprobării</h3>
                       
                       {pendingEvents.length === 0 ? (
                           <p className="empty-msg">Nu sunt cereri în așteptare.</p>
                       ) : (
                           <div className="events-list">
                               {pendingEvents.map(event => (
                                   <div key={event.id} className="admin-event-card pending">
                                       <div className="event-info">
                                           <h4 className="ev-title">{event.title}</h4>
                                           <p className="ev-meta">
                                               {event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : 'Organizator necunoscut'} • {new Date(event.startTime).toLocaleDateString('ro-RO')}
                                           </p>
                                       </div>
                                       <div className="event-actions">
                                           <button className="action-btn btn-details" onClick={() => handleViewDetails(event.id)}>
                                               <FaEye /> Detalii
                                           </button>
                                           <button className="action-btn btn-approve" onClick={() => handleApprove(event.id)}>
                                               <FaCheck /> Aprobă
                                           </button>
                                           <button className="action-btn btn-reject" onClick={() => handleReject(event.id)}>
                                               <FaTimes /> Respinge
                                           </button>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       )}
                   </div>

                   <div className="section-block">
                       <h3 className="section-title">Evenimente publicate</h3>
                       
                       {publishedEvents.length === 0 ? (
                           <p className="empty-msg">Nu există evenimente publicate momentan.</p>
                       ) : (
                           <div className="events-list">
                               {publishedEvents.map(event => (
                                   <div key={event.id} className="admin-event-card published">
                                       <div className="event-info">
                                           <h4 className="ev-title">{event.title}</h4>
                                           <p className="ev-meta">
                                               {event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : 'Organizator'} • {new Date(event.startTime).toLocaleDateString('ro-RO')} • {event.location || 'Locație nespecificată'}
                                           </p>
                                       </div>
                                       <div className="event-actions">
                                           <button className="action-btn btn-details" onClick={() => handleViewDetails(event.id)}>
                                               <FaEye /> Vezi
                                           </button>
                                           <button className="action-btn btn-delete" onClick={() => handleDeletePublished(event.id)}>
                                               <FaTrash /> Șterge
                                           </button>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       )}
                   </div>

               </div>
           )}
       </div>
    </div>
  );
};

export default AdminDashboard;