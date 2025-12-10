import React, { useState, useEffect, useCallback } from 'react';
import EventCard from './EventCard';
import api from '../services/api'; 
import './OrganizerDashboard.css';

const OrganizerDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

 
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
      console.error("Eroare la încărcarea evenimentelor:", error);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


const handleSubmit = async (e) => {
    e.preventDefault();


    let finalImageUrl = formData.imageUrl;
    if (finalImageUrl && finalImageUrl.length > 250) {
        alert("Link-ul imaginii este prea lung!");
        finalImageUrl = "https://via.placeholder.com/300"; 
    }

    
    
    const finalStartTime = formData.startTime.length === 16 ? formData.startTime + ":00" : formData.startTime;
    const finalEndTime = formData.endTime.length === 16 ? formData.endTime + ":00" : formData.endTime;

    try {
      await api.post('/events', {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startTime: finalStartTime, 
        endTime: finalEndTime,    
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null,
        imageUrl: finalImageUrl,   
        category: formData.category
      });

    
      setFormData({ ...formData, title: '', description: '', location: '', startTime: '', endTime: '', imageUrl: '' });
      setShowForm(false);
      await fetchMyEvents();
      alert("Eveniment creat cu succes!");

    } catch (error) {
  
       console.error(error);
       alert("Eroare la creare: Verifica consola.");
    }
  };

 
  const renderEventList = () => {
    if (loading) return <p style={{textAlign:'center'}}>Se încarcă evenimentele...</p>;
    
    if (myEvents.length === 0) {
        return <p className="no-events">Nu ai creat niciun eveniment încă.</p>;
    }

    return (
        <div className="events-grid">
  {myEvents.map((event) => (
      <EventCard 
          key={event.id}
          id={event.id}                
          title={event.title}          
          location={event.location}     
          date={event.startTime}        
          description={event.description} 
          imageUrl={event.imageUrl}    
          category={event.category}     
      />
  ))}
</div>
    );
  };

  return (
    <div className="organizer-container">
      <header className="organizer-header">
        <h1>Panou Organizator</h1>
        <p>Gestionează evenimentele tale</p>
      </header>


      <div className="controls-section">
        <button className="create-buton" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Anuleaza' : '+ Creeaza Eveniment Nou'}
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
              <label>Link Imagine (URL)</label>
              <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." />
            </div>

            <div className="form-group">
              <label>Descriere</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleChange} />
            </div>

            <button type="submit" className="save-buton">Salvează Evenimentul</button>
          </form>
        )}
      </div>

      <hr className="divider"/>

   
      <div className="my-events-section">
        <h2>Evenimentele Mele</h2>
        {renderEventList()}
      </div>
    </div>
  );
};

export default OrganizerDashboard;