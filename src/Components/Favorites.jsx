import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EventCard from './EventCard'; 
import './Favorites.css'; 
import { toast } from 'react-hot-toast';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  
 
  const [userRole, setUserRole] = useState('USER');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const pUser = JSON.parse(userData);
      const rawRole = pUser.roles && pUser.roles.length > 0 ? pUser.roles[0].toUpperCase() : 'USER';
      setUserRole(rawRole.replace('ROLE_', ''));
    } else {
        navigate('/'); 
    }
  }, [navigate]);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error("Eroare favorite:", error);
      toast.error("Nu s-au putut încărca favoritele.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  
  const handleToggle = () => {
      fetchFavorites();
  };

  return (
    <div className="favorites-page-container">
      
     
      <div className="fav-header-simple">
          <button className="back-arrow-btn" onClick={() => navigate('/home')}>←</button>
          <div className="fav-header-text">
              <h1>Favoritele mele</h1>
              <p>Evenimente pe care le-ai salvat pentru mai târziu</p>
          </div>
      </div>

    
      <div className="fav-grid-section">
          {loading ? (
             <p className="loading-text">Se încarcă lista...</p>
          ) : favorites.length > 0 ? (
             <div className="favorites-grid">
                 {favorites.map((favItem) => (
                    <EventCard 
                        key={favItem.id} 
                        
                        
                        id={favItem.eventId} 
                        title={favItem.eventTitle}
                        location={favItem.eventLocation}
                        date={favItem.eventDate || favItem.eventStartTime} 
                        imageUrl={favItem.eventImageUrl}
                        description={favItem.eventDescription || ""} 
                        category={favItem.category || "EVENT"}
                        organizer={favItem.organizer} 

                        
                        userRole={userRole} 
                        isFavoriteProp={true} 
                        onToggle={handleToggle}
                    />
                 ))}
             </div>
          ) : (
             <div className="empty-state">
                <p>Nu ai niciun eveniment favorit. ❤️</p>
                <button className="explore-btn" onClick={() => navigate('/home')}>
                    Explorează Evenimente
                </button>
             </div>
          )}
      </div>
    </div>
  );
};

export default Favorites;