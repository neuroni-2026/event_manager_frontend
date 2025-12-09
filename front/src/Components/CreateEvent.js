import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventService from '../services/event.service'; 

const CreateEvent = () => {
  const navigate = useNavigate();
  
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: 'CONCERT', 
    price: 0,
    maxParticipants: 100
  });

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await EventService.createEvent(eventData);
      alert("Eveniment creat cu succes! Așteaptă aprobarea adminului.");
      navigate('/my-events'); 
    } catch (error) {
      console.error("Eroare la creare:", error);
      alert("Nu am putut crea evenimentul. Verifica daca esti Organizator.");
    }
  };

  return (
    <div className="create-event-container">
      <h2>Creează un Eveniment Nou</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Titlu" onChange={handleChange} required />
        <textarea name="description" placeholder="Descriere" onChange={handleChange} required />
        <input type="datetime-local" name="date" onChange={handleChange} required />
        <input name="location" placeholder="Locație" onChange={handleChange} required />
        
        <select name="category" onChange={handleChange}>
            <option value="CONCERT">Concert</option>
            <option value="CONFERENCE">Conferință</option>
            <option value="WORKSHOP">Workshop</option>
        </select>

        <input type="number" name="price" placeholder="Preț (RON)" onChange={handleChange} />
        <input type="number" name="maxParticipants" placeholder="Nr. Max Participanți" onChange={handleChange} />
        
        <button type="submit">Publică Eveniment</button>
      </form>
    </div>
  );
};

export default CreateEvent;