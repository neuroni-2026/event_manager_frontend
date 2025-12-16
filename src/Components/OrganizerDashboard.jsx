import React, { useState, useCallback, useEffect } from 'react';
import EventCard from './EventCard';
import api from '../services/api'; 
import './OrganizerDashboard.css';
import Circle from '../Icons/circle.png';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; 

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [user, setUser] = useState({
    firstName: 'Vizitator',
    lastName: '',
    role: 'Neautentificat'
  });

  const [formData, setFormData] = useState({
    title: '', description: '', location: '', startTime: '',
    endTime: '', maxCapacity: '', imageUrl: '', category: 'SOCIAL'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '', description: '', location: '', startTime: '',
    endTime: '', maxCapacity: '', imageUrl: '', category: 'SOCIAL'
  });

  const fetchMyEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/events/my-events'); 
      setMyEvents(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Eroare la incarcarea evenimentelor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyEvents();
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const rawRole = parsedUser.roles && parsedUser.roles.length > 0 
                        ? parsedUser.roles[0].toUpperCase() 
                        : 'ORGANIZATOR';
        const cleanRole = rawRole.replace('ROLE_', '');

        setUser({
          firstName: parsedUser.firstName || '',
          lastName: parsedUser.lastName || '',
          role: cleanRole 
        });
      } catch (e) {
        localStorage.removeItem('user');
        navigate('/');
      }
    } else {
        navigate('/');
    }
  }, [fetchMyEvents, navigate]);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Esti sigur ca vrei sa stergi acest eveniment?')) return;

    try {
      await api.delete(`/events/${eventId}`);
      setMyEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      toast.success('Eveniment sters cu succes!');
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 403) {
          toast.error('Nu ai permisiunea sa stergi acest eveniment.');
      } else {
          toast.error('A aparut o eroare la stergere.');
      }
    }
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleImageUpload = async (e, isEditMode = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; 
    if (file.size > maxSize) {
        toast.error('Imaginea este prea mare! Te rog alege o poza sub 10MB.');
        e.target.value = null; 
        return;
    }

    const data = new FormData();
    data.append("file", file);

    try {
      setUploadingImage(true);
      const response = await api.post('/images/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = response.data.url;
      
      if (isEditMode) {
        setEditFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
      } else {
        setFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
      }
      toast.success("Imagine incarcata!");
    } catch (error) {
      console.error(error);
      toast.error('Nu am putut incarca imaginea.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.startTime || !formData.endTime) {
       toast.error('Titlul si datele sunt obligatorii!');
       return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startTime: formData.startTime.length === 16 ? formData.startTime + ":00" : formData.startTime,
        endTime: formData.endTime.length === 16 ? formData.endTime + ":00" : formData.endTime,
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null,
        imageUrl: formData.imageUrl, 
        category: formData.category
      };

      await api.post('/events', payload);

      setFormData({
        title: '', description: '', location: '', startTime: '',
        endTime: '', maxCapacity: '', imageUrl: '', category: 'SOCIAL'
      });
      setShowForm(false);
      await fetchMyEvents();
      toast.success('Eveniment creat cu succes! Asteapta aprobarea adminului.');

    } catch (error) {
      console.error(error);
      toast.error('Eroare la creare eveniment.');
    }
  };

  const openEditModal = (event) => {
    setCurrentEventId(event.id);
    const formatForInput = (dateString) => {
        if(!dateString) return '';
        return new Date(dateString).toISOString().slice(0, 16);
    };

    setEditFormData({
        title: event.title,
        description: event.description || '',
        location: event.location,
        category: event.category || 'SOCIAL',
        maxCapacity: event.maxCapacity || '',
        startTime: formatForInput(event.startTime),
        endTime: formatForInput(event.endTime),
        imageUrl: event.imageUrl || ''
    });
    setIsEditing(true);
  };

  const handleUpdateSubmit = async (e) => {
      e.preventDefault();
      try {
          const payload = {
            ...editFormData,
            startTime: editFormData.startTime.length === 16 ? editFormData.startTime + ":00" : editFormData.startTime,
            endTime: editFormData.endTime.length === 16 ? editFormData.endTime + ":00" : editFormData.endTime,
            maxCapacity: editFormData.maxCapacity ? parseInt(editFormData.maxCapacity) : null,
          };

          await api.put(`/events/${currentEventId}`, payload);
          
          setMyEvents(prev => prev.map(ev => 
            ev.id === currentEventId ? { ...ev, ...payload, id: currentEventId } : ev
          ));

          toast.success("Eveniment actualizat!");
          setIsEditing(false);
      } catch (error) {
          console.error(error);
          toast.error("Eroare la actualizare.");
      }
  };

  return (
    <div className="organizer-container">
      <div className="Header">
         <h1>Event Manager</h1>
         <div className="user-info">
            <button onClick={() => navigate(-1)} style={{background: 'black', border: 'none', color: 'white', cursor: 'pointer', marginRight: '10px'}}>
               Back
            </button>
            <div className="user-text">
                <span className="user-role">{user.role}</span>
                <span className="user-name">{user.firstName} {user.lastName}</span>
            </div>
            <img src={Circle} alt="icon" className="circle-icon"/>
         </div>
      </div>

      <header className="organizer-header">
        <h1 style={{color:'black'}}>Panou Organizator</h1>
        <p style={{color:'black'}}>Gestioneaza evenimentele tale</p>
      </header>

      <div className="controls-section">
        <button className="create-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Anulează' : '+ Creează Eveniment Nou'}
        </button>

        {showForm && (
          <form className="event-form" onSubmit={handleCreateSubmit}>
            <h3>Detalii Eveniment Nou</h3>
            
            <div className="form-group">
              <label>Titlu *</label>
              <input type="text" name="title" value={formData.title} onChange={handleCreateChange} required />
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label>Categorie</label>
                    <select name="category" value={formData.category} onChange={handleCreateChange} style={{background:'white'}}>
                        <option value="SOCIAL">Social</option>
                        <option value="ACADEMIC">Academic</option>
                        <option value="CULTURAL">Cultural</option>
                        <option value="SPORT">Sport</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Capacitate Max</label>
                    <input type="number" name="maxCapacity" value={formData.maxCapacity} onChange={handleCreateChange} />
                </div>
            </div>

            <div className="form-group">
              <label>Locație *</label>
              <input type="text" name="location" value={formData.location} onChange={handleCreateChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time *</label>
                <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleCreateChange} required/>
              </div>
              <div className="form-group">
                <label>End Time *</label>
                <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleCreateChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Imagine Eveniment</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} className="file-input"/>
              {uploadingImage && <p style={{color: '#aaa', fontSize:'12px'}}>Se incarca imaginea...</p>}
              {formData.imageUrl && !uploadingImage && (
                  <div style={{marginTop: '10px'}}>
                      <p style={{color: '#4caf50', fontSize:'12px'}}>Imagine incarcata!</p>
                      <img src={formData.imageUrl} alt="Preview" style={{width: '100px', height: '60px', objectFit: 'cover', borderRadius: '5px', marginTop:'5px'}} />
                  </div>
              )}
            </div>
          
            <div className="form-group">
              <label>Descriere</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleCreateChange} />
            </div>

            <button type="submit" className="save-btn" disabled={uploadingImage}>
                {uploadingImage ? 'Asteapta incarcarea...' : 'Salveaza Evenimentul'}
            </button>
          </form>
        )}
      </div>

      <hr className="divider"/>

      <div className="my-events-section">
        <h2>Evenimentele Mele</h2>
        {loading ? <p>Se incarca...</p> : (
            <div className="events-grid">
               {myEvents.length > 0 ? (
                   myEvents.map((event) => (
                     <EventCard 
                       key={event.id}
                       id={event.id}
                       title={event.title}
                       date={event.startTime}
                       location={event.location}
                       description={event.description}
                       imageUrl={event.imageUrl} 
                       category={event.category}
                       
                       
                       onDelete={() => handleDeleteEvent(event.id)}
                       onEdit={() => openEditModal(event)} 
                     />
                   ))
               ) : (
                   <p style={{color: '#888'}}>Nu ai creat niciun eveniment inca.</p>
               )}
            </div>
        )}
      </div>

      {isEditing && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
            <div className="modal-content" style={{background: '#fff', padding: '20px', borderRadius: '8px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto'}}>
                <h3 style={{color: 'black', marginBottom: '15px'}}>Editează Eveniment</h3>
                <form onSubmit={handleUpdateSubmit} className="event-form" style={{background: 'transparent', padding: 0, boxShadow: 'none'}}>
                    <div className="form-group"><label style={{color:'black'}}>Titlu</label><input type="text" name="title" value={editFormData.title} onChange={handleEditChange} required style={{border: '1px solid #ccc', color: 'black'}}/></div>
                    <div className="form-row">
                        <div className="form-group"><label style={{color:'black'}}>Categorie</label><select name="category" value={editFormData.category} onChange={handleEditChange} style={{background:'white', border: '1px solid #ccc', color: 'black'}}><option value="SOCIAL">Social</option><option value="ACADEMIC">Academic</option><option value="CULTURAL">Cultural</option><option value="SPORT">Sport</option></select></div>
                        <div className="form-group"><label style={{color:'black'}}>Capacitate</label><input type="number" name="maxCapacity" value={editFormData.maxCapacity} onChange={handleEditChange} style={{border: '1px solid #ccc', color: 'black'}}/></div>
                    </div>
                    <div className="form-group"><label style={{color:'black'}}>Locație</label><input type="text" name="location" value={editFormData.location} onChange={handleEditChange} required style={{border: '1px solid #ccc', color: 'black'}}/></div>
                    <div className="form-row">
                        <div className="form-group"><label style={{color:'black'}}>Start</label><input type="datetime-local" name="startTime" value={editFormData.startTime} onChange={handleEditChange} required style={{border: '1px solid #ccc', color: 'black'}}/></div>
                        <div className="form-group"><label style={{color:'black'}}>End</label><input type="datetime-local" name="endTime" value={editFormData.endTime} onChange={handleEditChange} required style={{border: '1px solid #ccc', color: 'black'}}/></div>
                    </div>
                    <div className="form-group"><label style={{color:'black'}}>Imagine</label><input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />{uploadingImage && <p style={{color: '#aaa', fontSize:'12px'}}>Se incarca...</p>}{editFormData.imageUrl && (<img src={editFormData.imageUrl} alt="Preview" style={{width: '80px', height: '50px', objectFit: 'cover', marginTop:'5px'}} />)}</div>
                    <div className="form-group"><label style={{color:'black'}}>Descriere</label><textarea name="description" rows="3" value={editFormData.description} onChange={handleEditChange} style={{border: '1px solid #ccc', color: 'black', background:'white'}}/></div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
                        <button type="button" onClick={() => setIsEditing(false)} style={{padding: '10px 20px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Anulează</button>
                        <button type="submit" style={{padding: '10px 20px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Salvează</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;