import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EventCard.css'; 
import DefaultImage from '../Images/ASSIST.png'; 


const EventCard = ({ id, title, description, location, date, imageUrl, category }) => {
  const navigate = useNavigate();
  

  const formatDate = (isoString) => {
    if (!isoString) return { day: '??', month: 'NAN' };
    
    const d = new Date(isoString);
    const day = d.getDate(); 

    const month = d.toLocaleDateString('ro-RO', { month: 'short' }).toUpperCase();
    
    return { day, month };
  };

  const { day, month } = formatDate(date);

const handleClick = () => {
   
    navigate(`/event_detalii/${id}`);
  };

  return (
    <div className="card-wrapper">
   
      <div className="card-image-header">
       
        <img 
            src={imageUrl || DefaultImage} 
            alt={title} 
            className="card-img" 
            onError={(e) => {e.target.src = DefaultImage}}
        />
        
       
        <div className="card-date-badge">
            <span className="date-day">{day}</span>
            <span className="date-month">{month}</span>
        </div>
      </div>
      
     
      <div className="card-body">
        
       
        <div className="card-tags">
        
          <span className="tag tag-green">USV</span> 
          
      
          <span className="tag tag-blue">{category || 'EVENT'}</span>
        </div>

       
        <h3 className="card-title" title={title}>
            {title}
        </h3>
        
       
        <p className="card-description">
          {description 
            ? (description.length > 80 ? description.substring(0, 80) + "..." : description)
            : "Fara descriere disponibila."}
        </p>
        
       
        <div className="card-footer">
            <div className="card-location">
              <span className="location-icon">📍</span> 
            
              <span>{location}</span>
            </div>
            <button className="btn-details" onClick={handleClick}>
                DETALII
            </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;