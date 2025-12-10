import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import './EventCardDetails.css'; 
import usv from '../Images/usv.jpg'; 
import Ticket from './Ticket';
import Circle from '../Icons/circle.png';
import api from '../services/api'; 

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState('');

  const [showTicket, setShowTicket] = useState(false);
  
 
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


  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        
        const response = await api.get(`/events/${id}`);
        setEvent(response.data);
      } catch (err) {
        console.error("Eroare la incarcarea evenimentului:", err);
        setError("Nu am putut incarca detaliile evenimentului.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
        fetchEventDetails();
    }
  }, [id]);


  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const d = new Date(isoString);
    return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (isoString) => {
    if (!isoString) return "N/A";
    const d = new Date(isoString);
    return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  };

  const handleClick = () => {
    navigate(-1);
  };

  const handleParticipa = () => {
    
    setShowTicket(true);
  };

  const handleClose = () => {
    setShowTicket(false);
  };


  if (loading) return <div className="loading-screen">Se încarcă detaliile...</div>;
  if (error) return <div className="error-screen">{error} <button onClick={handleClick}>Înapoi</button></div>;
  if (!event) return null;

  return (
    <div className="event-pagina">

        <div className="Header">
        <h1>Event Manager</h1>
        
        <div className="user-info">
          <p className="user-name">
            {user.firstName} {user.lastName} <br/>
              {user.role}
          </p>
          <img src={Circle} alt="circle" className="circle-icon"/>
        </div>
      </div>

      <div className="card-detalii">
        
        <div className="header">
          <button className="back" onClick={handleClick}>&lt; Back</button>
 
          <h1 className="event-title">{event.title}</h1>
        </div>

        <div className="content-card">
          
          <div className="card-imagine">
   
            <img 
              src={event.imageUrl || usv}
              alt={event.title} 
              className="event-imagine"
              onError={(e) => {e.target.src = usv}} 
            />
          </div>

          <div className="info-panel">
            <div className="info-group">
              <label>Organizator:</label>
     
              <div className="info-value">
                 {event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : "Necunoscut"}
              </div>
            </div>
            
            <div className="info-group">
              <label>Locatie:</label>
              <div className="info-value">{event.location}</div>
            </div>

            <div className="info-group">
              <label>Data:</label>
              <div className="info-value">{formatDate(event.startTime)}</div>
            </div>

            <div className="info-group">
              <label>Ora:</label>
              <div className="info-value">{formatTime(event.startTime)}</div>
            </div>

            <div className="info-group">
              <label>Sfârșit Eveniment:</label>
              <div className="info-value">
                {formatDate(event.endTime)}, {formatTime(event.endTime)}
              </div>
            </div>

         
            <div className="info-group">
              <label>Categorie:</label>
              <div className="info-value">{event.category}</div>
            </div>

            <button onClick={handleParticipa} className="buton-participare">PARTICIP</button>
          </div>
          
        </div>

        <div className="description">
          <h3>Descriere</h3>
          <p>
            {event.description || "Acest eveniment nu are o descriere."}
          </p>
        </div>

      </div>
      

      {showTicket && <Ticket event={event} onClose={handleClose} />}
    </div>
  );
};

export default EventDetails;