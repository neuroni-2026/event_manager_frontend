import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import './EventCard.css'; 
import DefaultImage from '../Images/usv.jpg'; 
import Location from '../Icons/location_icon.png';
import toast from 'react-hot-toast';

const EventCard = ({ 
    id, title, description, location, date, imageUrl, category, 
    onDelete, onEdit, onBuyTicket, isPurchasing, 
    userRole, currentUserRole, isFavoriteProp, onToggle           
}) => {
  const navigate = useNavigate();
  const activeRole = userRole || currentUserRole;
  const [isFavorite, setIsFavorite] = useState(isFavoriteProp || false);

  useEffect(() => {
     if (activeRole === 'STUDENT' && isFavoriteProp === undefined && id) {
         const checkFav = async () => {
             try {
                 const res = await api.get(`/favorites/check/${id}`);
                 setIsFavorite(res.data);
             } catch (e) { console.error(e); }
         };
         checkFav();
     }
  }, [id, activeRole, isFavoriteProp]);

  
  const formatDate = (isoString) => {
    if (!isoString) return { text: 'DATA' };
    const d = new Date(isoString);
    const month = d.toLocaleDateString('ro-RO', { month: 'short' }).toUpperCase().replace('.', '');
    const day = d.getDate();
    return { text: `${month} ${day}` }; 
  };

    const CATEGORY_COLORS = {
  SOCIAL: '#ffcc00',     
  ACADEMIC: '#4a90e2',   
  SPORT: '#2ecc71',      
  CAREER: '#8e44ad',     
  VOLUNTEERING: '#3498db', 
  OTHER: '#95a5a6'      
};
  const { text: dateText } = formatDate(date);

  const handleClick = () => { if (id) navigate(`/event_detalii/${id}`); };
  const handleDeleteClick = (e) => { e.stopPropagation(); if (onDelete) onDelete(id); };
  const badgeColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.OTHER;

  return (
    <div className="event-card-container" onClick={handleClick}>
      <div className="card-media">
        <img 
            src={imageUrl || DefaultImage} 
            alt={title} 
            className="card-img" 
            onError={(e) => {e.target.src = DefaultImage}} 
        />
        
       
        <div className="badge-category" style={{ backgroundColor: badgeColor }}>
          
            {category || 'Event'}
        </div>

       
        <div className="badge-date">
            {dateText}
        </div>

        
        {onDelete && (
             <button className="overlay-btn delete-btn" onClick={handleDeleteClick}>🗑️</button>
        )}
      </div>
      
      <div className="card-content">
        <div className="card-top-info">
        <h3 className="card-title" title={title}>{title || "Titlu"}</h3>
        
        <p className="card-desc" style={{color:"#252525ff"}}>
          {description 
            ? (description.length > 80 ? description.substring(0, 80) + "..." : description)
            : "Fara descriere."}
        </p>
        </div>
        <div className="divider-line" style={{backgroundColor:"black", width:"100%", opacity:"0.3"}}></div>
        <div className="card-footer">
            <div className="card-loc">
              <span className="pin-icon"><img src={Location} alt="Pin" style={{width:"15px", height:"15px"}} /></span> 
              <span>{location || 'Online'}</span>
            </div>
            
            
            <div className="card-action">
                {onEdit ? (
                    <button className="btn-action red-btn" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                        Edit
                    </button>
                ) : (
                    <button className="btn-action red-btn" onClick={handleClick}>
                        Detalii
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;