import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EventCard from './EventCard'; 
import './Favorites.css'; 
import { toast } from 'react-hot-toast';
import { Heart, ArrowRight } from 'lucide-react';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('USER');

  // Logica rămâne neschimbată
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
    <div className="fav-page-wrapper">
      
      {/* Header Modern (Conform image_b9d1a7.png) */}
      <div className="fav-header-modern">
          <div className="fav-header-icon-box">
              <Heart size={28} fill="#ff6b6b" color="#ff6b6b" />
          </div>
          <div className="fav-header-info">
              <h1>Evenimente Favorite</h1>
              <p>Evenimentele pe care le-ai salvat pentru mai târziu.</p>
          </div>
      </div>

      {/* Containerul Alb Principal */}
      <div className="fav-main-content-card">
          {loading ? (
              <div className="fav-loader-container">
                  <div className="fav-spinner"></div>
                  <p>Se încarcă lista...</p>
              </div>
          ) : favorites.length > 0 ? (
              <div className="favorites-grid-modern">
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
              /* Empty State (Conform image_b9d1a7.png) */
              <div className="fav-empty-state">
                  <div className="fav-empty-icon-circle">
                      <Heart size={42} color="#ff6b6b" strokeWidth={1.5} />
                  </div>
                  <h2>Niciun eveniment salvat</h2>
                  <p>Explorează evenimentele disponibile și salvează-le pe cele care te interesează.</p>
                  <button className="fav-explore-btn" onClick={() => navigate('/home')}>
                      Explorează Evenimente <ArrowRight size={18} />
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};

export default Favorites;