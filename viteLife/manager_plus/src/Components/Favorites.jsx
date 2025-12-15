import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EventCard from './EventCard';
import Circle from '../Icons/circle.png';
import './Home.css'; 
import { toast } from 'react-hot-toast';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ firstName: '', lastName: '', role: '' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const pUser = JSON.parse(userData);
      const rawRole = pUser.roles && pUser.roles.length > 0 ? pUser.roles[0].toUpperCase() : 'USER';
      setUser({
        firstName: pUser.firstName,
        lastName: pUser.lastName,
        role: rawRole.replace('ROLE_', '')
      });
    } else {
        navigate('/home'); 
    }
  }, [navigate]);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error("Eroare favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRefresh = () => {
      fetchFavorites();
  };

  return (
    <div className="home-container">
      <div className="Header">
        <h1>Favoritele Mele</h1>
        <div className="user-info">
            <button className="wallet-icon-btn" onClick={() => navigate('/home')} title="Înapoi la Home">
                 Home
            </button>
            <div className="user-text">
                <span className="user-role">{user.role}</span>
                <span className="user-name">{user.firstName} {user.lastName}</span>
            </div>
            <img src={Circle} alt="Profile" className="circle-icon"/>
        </div>
      </div>

      <div className="grid-container" style={{marginTop:'20px'}}>
        <div className="Grid">
          {loading ? (
             <p style={{color:'white'}}>Se încarcă lista...</p>
          ) : favorites.length > 0 ? (
             favorites.map((favItem) => (
                <EventCard 

                    key={favItem.id} 
                    
                    
                    id={favItem.eventId} 
                    
                    title={favItem.eventTitle}
                    location={favItem.eventLocation}
                    date={favItem.eventDate}
                    imageUrl={favItem.eventImageUrl}
                    
                    description={favItem.eventDescription || ""} 
                    category={favItem.category || "EVENT"}

                    currentUserRole={user.role} 
                    isFavoriteProp={true} 
                    onToggle={handleRefresh} 
                />
             ))
          ) : (
             <p style={{color: '#ccc', gridColumn: '1 / -1', textAlign: 'center'}}>
                Nu ai niciun eveniment favorit. ❤️
             </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;