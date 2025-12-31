import React, { useState, useCallback, useEffect } from 'react';
import EventCard from './EventCard';
import api from '../services/api'; 
import './OrganizerDashboard.css';
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
    title: '', 
    description: '', 
    location: '', 
    startTime: '',
    endTime: '', 
    maxCapacity: '', 
    imageUrl: '', 
    category: 'SOCIAL'
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
      toast.error('A aparut o eroare la stergere.');
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

    
    let safeCapacity = null;
    if (formData.maxCapacity !== '' && formData.maxCapacity !== null) {
        const parsed = parseInt(formData.maxCapacity, 10);
        if (!isNaN(parsed)) {
            safeCapacity = parsed;
        }
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startTime: formData.startTime.length === 16 ? formData.startTime + ":00" : formData.startTime,
        endTime: formData.endTime.length === 16 ? formData.endTime + ":00" : formData.endTime,
        
       
        maxCapacity: safeCapacity,
        
        imageUrl: formData.imageUrl, 
        category: formData.category
      };

      console.log("Payload trimis:", payload);

      await api.post('/events', payload);

      setFormData({
        title: '', description: '', location: '', startTime: '',
        endTime: '', maxCapacity: '', imageUrl: '', category: 'SOCIAL'
      });
      setShowForm(false);
      await fetchMyEvents();
      toast.success('Eveniment creat cu succes!');

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
        
        maxCapacity: (event.maxCapacity !== null && event.maxCapacity !== undefined) ? event.maxCapacity : '',
        startTime: formatForInput(event.startTime),
        endTime: formatForInput(event.endTime),
        imageUrl: event.imageUrl || ''
    });
    setIsEditing(true);
  };

  
  const handleUpdateSubmit = async (e) => {
      e.preventDefault();
      
      let safeCapacity = null;
      if (editFormData.maxCapacity !== '' && editFormData.maxCapacity !== null) {
          const parsed = parseInt(editFormData.maxCapacity, 10);
          if (!isNaN(parsed)) {
              safeCapacity = parsed;
          }
      }

      try {
          const payload = {
            ...editFormData,
            startTime: editFormData.startTime.length === 16 ? editFormData.startTime + ":00" : editFormData.startTime,
            endTime: editFormData.endTime.length === 16 ? editFormData.endTime + ":00" : editFormData.endTime,
            maxCapacity: safeCapacity,
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
      
    
      <div className="top-nav-header">
         <button className="back-arrow-btn" onClick={() => navigate(-1)}>←</button>
      </div>

      <div className="content-wrapper">
        
        {showForm ? (
            <div className="page-header-simple">
                <h1>Crează eveniment nou</h1>
                <p>Completează detaliile pentru a crea evenimentul tău</p>
            </div>
        ) : (
            <header className="organizer-header">
                <h1>Panou Organizator</h1>
                <p>Gestioneaza evenimentele tale</p>
            </header>
        )}

        <div className="controls-section">
            {!showForm && (
                <button className="create-btn-primary" onClick={() => setShowForm(true)}>
                + Creează Eveniment Nou
                </button>
            )}

            {showForm && (
            <form className="event-form-clean" onSubmit={handleCreateSubmit}>
                
                <div className="form-group">
                    <label>Titlu eveniment *</label>
                    <input 
                        type="text" 
                        name="title" 
                        placeholder="Introdu titlul evenimentului"
                        value={formData.title} 
                        onChange={handleCreateChange} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Descriere *</label>
                    <textarea 
                        name="description" 
                        rows="4" 
                        placeholder="Descriere detaliată a evenimentului"
                        value={formData.description} 
                        onChange={handleCreateChange} 
                    />
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Facultate / Categorie *</label>
                        <select name="category" value={formData.category} onChange={handleCreateChange}>
                            <option value="SOCIAL">Social</option>
                            <option value="ACADEMIC">Academic</option>
                            <option value="SPORT">Sport</option>
                            <option value="CAREER">Career</option>
                            <option value="VOLUNTEERING">Volunteering</option>
                        </select>
                    </div>
                    
                    
                    <div className="form-group">
                        <label>Capacitate (Locuri) *</label>
                        <input 
                            type="number" 
                            name="maxCapacity" 
                            placeholder="Ex: 100"
                            value={formData.maxCapacity} 
                            onChange={handleCreateChange} 
                            min="1"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Locație *</label>
                    <input 
                        type="text" 
                        name="location" 
                        placeholder="Introdu locația evenimentului"
                        value={formData.location} 
                        onChange={handleCreateChange} 
                        required 
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Dată și Oră început *</label>
                        <input 
                            type="datetime-local" 
                            name="startTime" 
                            value={formData.startTime} 
                            onChange={handleCreateChange} 
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Dată și Oră finalizare</label>
                        <input 
                            type="datetime-local" 
                            name="endTime" 
                            value={formData.endTime} 
                            onChange={handleCreateChange} 
                            required 
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Imagine eveniment</label>
                    <div className="file-upload-wrapper">
                        <label htmlFor="file-upload" className="custom-file-upload">
                            <span className="upload-icon">↑</span> Încărcă imagine
                        </label>
                        <span className="file-name-display">
                            {uploadingImage ? 'Se încarcă...' : (formData.imageUrl ? 'Imagine selectată' : 'Niciun fișier selectat')}
                        </span>
                        <input 
                            id="file-upload" 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(e, false)} 
                        />
                    </div>
                    {formData.imageUrl && !uploadingImage && (
                        <div className="img-preview-small">
                            <img src={formData.imageUrl} alt="Preview" />
                        </div>
                    )}
                </div>

                <div className="info-box-green">
                    Evenimentul tău va fi trimis pentru revizuire de către admin. Vei fi notificat odată ce este aprobat și publicat.
                </div>
                
                <div className="form-actions-row">
                    <button type="button" className="btn-cancel" onClick={() => setShowForm(false)} disabled={uploadingImage}>
                        Anulează
                    </button>
                    <button type="submit" className="btn-submit" disabled={uploadingImage}>
                        {uploadingImage ? 'Se procesează...' : 'Trimite pentru aprobare'}
                    </button>
                </div>
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
                        maxCapacity={event.maxCapacity}
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
            <div className="modal-overlay">
                <div className="modal-content-clean">
                    <h3>Editează Eveniment</h3>
                    <form onSubmit={handleUpdateSubmit} className="edit-form-clean">
                        <div className="form-group"><label>Titlu</label><input type="text" name="title" value={editFormData.title} onChange={handleEditChange} required/></div>
                        <div className="form-row">
                            <div className="form-group"><label>Categorie</label><select name="category" value={editFormData.category} onChange={handleEditChange}><option value="SOCIAL">Social</option><option value="ACADEMIC">Academic</option><option value="CULTURAL">Cultural</option><option value="SPORT">Sport</option></select></div>
                            
                        
                            <div className="form-group"><label>Capacitate</label><input type="number" name="maxCapacity" value={editFormData.maxCapacity} onChange={handleEditChange}/></div>
                        
                        </div>
                        <div className="form-group"><label>Locație</label><input type="text" name="location" value={editFormData.location} onChange={handleEditChange} required/></div>
                        <div className="form-row">
                            <div className="form-group"><label>Start</label><input  type="datetime-local" name="startTime" value={editFormData.startTime} onChange={handleEditChange} required/></div>
                            <div className="form-group"><label>End</label><input type="datetime-local" name="endTime" value={editFormData.endTime} onChange={handleEditChange} required/></div>
                        </div>
                        <div className="form-group"><label>Imagine</label><input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} /></div>
                        <div className="form-group"><label>Descriere</label><textarea name="description" rows="3" value={editFormData.description} onChange={handleEditChange}/></div>
                        <div className="form-actions-row">
                            <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Anulează</button>
                            <button type="submit" className="btn-submit">Salvează</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;