import React, { useState, useEffect, useMemo } from 'react';
import EventCard from './EventCard';
import SearchIcon from '../Icons/icon-search.png';
import Circle from '../Icons/circle.png';
import api from '../services/api';
import './Home.css';
import NotificationBell from './NotificationBell';

const Home = () => {

  const [user, setUser] = useState({ firstName: 'Vizitator', lastName: '', role: 'Neautentificat' });
  const [events, setEvents] = useState([]);       
  const [filteredEvents, setFilteredEvents] = useState([]); 
  const [loading, setLoading] = useState(true);

  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    organizer: '',
    location: '',
    category: '',
    faculty: '' 
  });

  
 useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      
     
      const rawRole = parsedUser.roles && parsedUser.roles[0].toUpperCase() 
      const cleanRole = rawRole.replace('ROLE_', '');

      setUser({
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        role: cleanRole 
      });
    }
  }, []);


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(response.data);
        setFilteredEvents(response.data);
      } catch (error) {
        console.error("Eroare la incarcarea evenimentelor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);


  const uniqueLocations = useMemo(() => {
    return [...new Set(events.map(e => e.location))].filter(Boolean);
  }, [events]);

  const uniqueCategories = useMemo(() => {
    return [...new Set(events.map(e => e.category))].filter(Boolean);
  }, [events]);

  const uniqueOrganizers = useMemo(() => {

    return [...new Set(events.map(e => e.organizer ? `${e.organizer.firstName} ${e.organizer.lastName}` : ''))].filter(Boolean);
  }, [events]);


  useEffect(() => {
    const results = events.filter(event => {
    
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());

     
      const matchesLocation = filters.location 
        ? event.location === filters.location 
        : true; 

    
      const matchesCategory = filters.category 
        ? event.category === filters.category 
        : true;

    
      const organizerName = event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : '';
      const matchesOrganizer = filters.organizer 
        ? organizerName === filters.organizer 
        : true;

     
      return matchesSearch && matchesLocation && matchesCategory && matchesOrganizer;
    });

    setFilteredEvents(results);
  }, [searchTerm, filters, events]);

  
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="home-container">
   
      <div className="Header">
        <h1>Event Manager</h1>
        <div className="user-info">
          <NotificationBell />
          <div className="user-text">
            <span className="user-role">{user.role}</span>
            <span className="user-name">{user.firstName} {user.lastName}</span>
          </div>
          <img src={Circle} alt="Profile" className="circle-icon"/>
        </div>
      </div>

      
      <div className="search-container">
        <div className="Search">
          <img src={SearchIcon} className="search-icon" alt="Search" />
          <input 
            className="search-input" 
            type="text" 
            placeholder="Caută eveniment..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

   
      <div className="filters-container">
        
      
        <select 
            name="organizer" 
            className="filter-buton" 
            onChange={handleFilterChange}
            value={filters.organizer}
        >
            <option value="">Toți Organizatorii</option>
            {uniqueOrganizers.map(org => (
                <option key={org} value={org}>{org}</option>
            ))}
        </select>

      
        <select 
            name="location" 
            className="filter-buton" 
            onChange={handleFilterChange}
            value={filters.location}
        >
            <option value="">Toate Locațiile</option>
            {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
            ))}
        </select>

       
        <select 
            name="category" 
            className="filter-buton" 
            onChange={handleFilterChange}
            value={filters.category}
        >
            <option value="">Toate Tipurile</option>
            {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
            ))}
        </select>
        
       
        <button className="filter-buton calendar-buton">
           Calendar
        </button>
      </div>

     
      <div className="grid-container">
        <div className="Grid">
          {loading ? (
             <p style={{color: 'white', textAlign:'center', width:'100%'}}>Se încarca evenimentele...</p>
          ) : filteredEvents.length > 0 ? (
             filteredEvents.map((event) => (
                <EventCard 
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    date={event.startTime}
                    location={event.location}
                    description={event.description}
                    imageUrl={event.imageUrl}
                    category={event.category}
                />
             ))
          ) : (
             <p className="no-events-msg" style={{color: '#ccc', gridColumn: '1 / -1', textAlign: 'center'}}>
                Nu am gasit niciun eveniment conform filtrelor selectate.
             </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;