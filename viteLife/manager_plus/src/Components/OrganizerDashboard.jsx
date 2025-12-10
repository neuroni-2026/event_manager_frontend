import React, { useState, useCallback, useEffect } from 'react';
import EventCard from './EventCard';
import api from '../services/api'; 
import './OrganizerDashboard.css';
import Circle from '../Icons/circle.png';
const OrganizerDashboard = () => {
  
  
  const [showForm, setShowForm] = useState(false);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDeleteEvent = async (eventId) => {
   
    const confirm = window.confirm("Esti sigur ca vrei sa stergi acest eveniment?");
    if (!confirm) return;

    try {
      await api.delete(`/events/${eventId}`);
      setMyEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      
      alert("Eveniment sters cu succes!");

    } catch (error) {
      console.error("Eroare la stergere:", error);
      if (error.response && error.response.status === 403) {
          alert("Nu ai permisiunea sa stergi acest eveniment.");
      } else {
          alert("A aparut o eroare la stergere.");
      }
    }
    
  };
  

  const [uploadingImage, setUploadingImage] = useState(false);

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

 
  const fetchMyEvents = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get('/events/my-events'); 
      setMyEvents(response.data);
    } catch (error) {
      console.error("Eroare la incarcarea evenimentelor:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyEvents();
    const userData = localStorage.getItem('user');
    if (userData) {
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
    }
  }, [fetchMyEvents]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

 
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; 

    if (file.size > maxSize) {
        alert("Imaginea este prea mare! Te rog alege o poza sub 10MB.");

        e.target.value = null; 
        return;
    }


    const data = new FormData();
    data.append("file", file);

    try {
      setUploadingImage(true);
      

      const response = await api.post('/images/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data', 
        },
      });

  
      const uploadedUrl = response.data.url;
      console.log("Imagine incarcata cu succes:", uploadedUrl);
      

      setFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
      
    } catch (error) {
      console.error("Eroare la upload:", error);
      alert("Nu am putut incarca imaginea. Verifica marimea fisierului.");
    } finally {
      setUploadingImage(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    alert("Trimit URL: " + formData.imageUrl);
    if (!formData.title || !formData.startTime || !formData.endTime) {
        alert("Titlul si datele sunt obligatorii!");
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

      console.log("Trimit spre DB:", payload);

     
      await api.post('/events', payload);

      setFormData({
        title: '', description: '', location: '', startTime: '',
        endTime: '', maxCapacity: '', imageUrl: '', category: 'SOCIAL'
      });
      setShowForm(false);
      

      await fetchMyEvents();
      alert("Eveniment creat cu succes! AAsteapta aprobarea adminului.");

    } catch (error) {
      console.error("Eroare la creare:", error);
      alert("Eroare la creare eveniment. Verifica consola.");
    }
  };
  const [user, setUser] = useState({
      firstName: 'Vizitator',
      lastName: '',
      role: 'Neautentificat'
    });
  
  
    useEffect(() => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        let userRole = "USER";
        if (parsedUser.roles && parsedUser.roles.length > 0) {
          userRole = parsedUser.roles[0].toUpperCase(); 
        }
        setUser({
          firstName: parsedUser.firstName || '',
          lastName: parsedUser.lastName || '',
          role: userRole
        });
      }
    }, []);

  return (
    
    <div className="organizer-container">
              <div className="Header">
                              <h1>Event Manager</h1>
                              <div className="user-info">
                                 <div className="user-text">
                                     <span className="user-role">{user.role}</span>
                                     <span className="user-name">{user.firstName} {user.lastName}</span>
                                 </div>
                                 <img src={Circle} alt="icon" className="circle-icon"/>
                              </div>
                           </div>
      <header className="organizer-header">
        <h1>Panou Organizator</h1>
        <p>Gestionează evenimentele tale</p>
      </header>

      <div className="controls-section">
        <button className="create-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Anulează' : '+ Creează Eveniment Nou'}
        </button>

        {showForm && (
          <form className="event-form" onSubmit={handleSubmit}>
            <h3>Detalii Eveniment</h3>
            
          
            <div className="form-group">
              <label>Titlu *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label>Categorie</label>
                    <select name="category" value={formData.category} onChange={handleChange}>
                        <option value="SOCIAL">Social</option>
                        <option value="ACADEMIC">Academic</option>
                        <option value="CULTURAL">Cultural</option>
                        <option value="SPORT">Sport</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Capacitate Max</label>
                    <input type="number" name="maxCapacity" value={formData.maxCapacity} onChange={handleChange} />
                </div>
            </div>

        
            <div className="form-group">
              <label>Locație *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time *</label>
                <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>End Time *</label>
                <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} required />
              </div>
            </div>

           
            <div className="form-group">
              <label>Imagine Eveniment</label>
              
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="file-input"
              />
              
              {uploadingImage && <p style={{color: '#aaa', fontSize:'12px'}}>Se încarcă imaginea...</p>}
              
              
              {formData.imageUrl && !uploadingImage && (
                  <div style={{marginTop: '10px'}}>
                      <p style={{color: '#4caf50', fontSize:'12px'}}>Imagine încărcată!</p>
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        style={{width: '100px', height: '60px', objectFit: 'cover', borderRadius: '5px', marginTop:'5px'}}
                      />
                  </div>
              )}
            </div>
          
            
            <div className="form-group">
              <label>Descriere</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleChange} />
            </div>

        
            <button type="submit" className="save-btn" disabled={uploadingImage}>
                {uploadingImage ? 'Așteaptă încărcarea imaginii...' : 'Salvează Evenimentul'}
            </button>
          </form>
        )}
      </div>

      <hr className="divider"/>

      <div className="my-events-section">
        <h2>Evenimentele Mele</h2>

        {loading ? <p>Se încarcă...</p> : (
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
                       onDelete={handleDeleteEvent}
                     />
                   ))
               ) : (
                   <p style={{color: '#888'}}>Nu ai creat niciun eveniment încă.</p>
               )}
            </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;