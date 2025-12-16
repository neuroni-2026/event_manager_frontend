import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import './EventCard.css'; 
import DefaultImage from '../Images/usv.jpg'; 

import toast from 'react-hot-toast';

const EventCard = ({ 
    id, 
    title, 
    description, 
    location, 
    date, 
    imageUrl, 
    category, 
    
 
    onDelete,           
    onEdit,            
    onBuyTicket,        
    isPurchasing,       
    
    userRole,           
    currentUserRole,    
    isFavoriteProp,     
    onToggle           
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
    if (!isoString) return { day: '??', month: '-' };
    const d = new Date(isoString);
    return {
        day: d.getDate(),
        month: d.toLocaleDateString('ro-RO', { month: 'short' }).toUpperCase()
    };
  };
  const { day, month } = formatDate(date);

  const handleClick = () => {
    if (id) navigate(`/event_detalii/${id}`);
  };
  
  const handleFavoriteClick = async (e) => {
      e.stopPropagation(); 
      const newState = !isFavorite;
      setIsFavorite(newState);
      try {
          if (newState) {
             await api.post(`/favorites/${id}`);
             toast.success('Favorit ❤️');
          } else {
             await api.delete(`/favorites/${id}`);
             toast.success('Sters 💔');
          }
          if (onToggle) onToggle();
      } catch (error) { setIsFavorite(!newState); }
  };

  const handleDeleteClick = (e) => {
      e.stopPropagation();
      if (onDelete) onDelete(id);
  };

  return (
    <div className="card-wrapper" onClick={handleClick}>
      <div className="card-image-header">
        <img src={imageUrl || DefaultImage} alt={title} className="card-img" onError={(e) => {e.target.src = DefaultImage}} />
        <div className="card-date-badge"><span className="date-day">{day}</span><span className="date-month">{month}</span></div>
        <div className="card-overlays">
            {onDelete && (<button className="delete-icon-btn" onClick={handleDeleteClick} title="Șterge">🗑️</button>)}
            {activeRole === 'STUDENT' && (<button className={`fav-btn ${isFavorite ? 'active' : ''}`} onClick={handleFavoriteClick}>{isFavorite ? '❤️' : '🤍'}</button>)}
        </div>
      </div>
      
      <div className="card-body">
        <div className="card-tags"><span className="tag tag-green">USV</span><span className={`tag tag-blue`}>{category || 'EVENT'}</span></div>
        <h3 className="card-title">{title || "Titlu"}</h3>
        <p className="card-description">{description ? (description.length > 80 ? description.substring(0, 80) + "..." : description) : "Fara descriere."}</p>
        
        <div className="card-footer">
            <div className="card-location"><span className="location-icon">📍</span><span>{location || 'Online'}</span></div>
            <div className="card-actions-right">
                {onEdit ? (
                    
                    <button 
                        className="btn-details" 
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        style={{ backgroundColor: '#3498db' }} 
                    >
                        Edit
                    </button>
                
                ) : (
                   
                    <button className="btn-details" onClick={handleClick}>DETALII</button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;