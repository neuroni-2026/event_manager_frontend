import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from './EventCard';
import SearchIcon from '../Icons/icon-search.png';
import api, { ticketApi } from '../services/api'; 
import './Home.css';
import NotificationBell from '../Components/NotificationBell';


import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; 
import calendarIcon from '../Icons/calendar.png'; 


import ticket from '../Icons/ticket.png';
import heart from '../Icons/heart.png';
import logout from '../Icons/logout.png';
import setings from '../Icons/setings.png';
import shield from '../Icons/shield.png';
import organizer from '../Icons/organizer.png';
import { toast } from 'react-hot-toast';


const CATEGORY_COLORS = {
  SOCIAL: '#ffcc00',     
  ACADEMIC: '#4a90e2',   
  CULTURAL: '#e44d26',  
  SPORT: '#2ecc71',     
  OTHER: '#95a5a6'       
};

const Home = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const [user, setUser] = useState(null); 
  const [events, setEvents] = useState([]);       
  const [filteredEvents, setFilteredEvents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState(null);
  
  const [showDropdown, setShowDropdown] = useState(false);
  
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [date, setDate] = useState(new Date());

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    organizer: '',
    location: '',
    category: '',
    faculty: '' 
  });

 
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { navigate('/'); return; }
    try {
        const parsedUser = JSON.parse(userData);
        let displayRole = 'USER';
        if (parsedUser.roles && parsedUser.roles.length > 0) {
             const r = parsedUser.roles[0];
             displayRole = (typeof r === 'string' ? r : r.name).toUpperCase();
        }
        const cleanRole = displayRole.replace('ROLE_', '');
        setUser({
          ...parsedUser,
          firstName: parsedUser.firstName || '',
          lastName: parsedUser.lastName || '',
          role: cleanRole 
        });
    } catch (e) {
        localStorage.removeItem('user'); navigate('/');
    }
  }, [navigate]);

 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  
  const handleBuyTicket = async (eventId, eventTitle) => {
      const confirm = window.confirm(`Vrei să participi la "${eventTitle}"?`);
      if (!confirm) return;
      setPurchasingId(eventId);
      try {
          await ticketApi.purchase(eventId);
          toast.success("Te-ai înscris cu succes!");
      } catch (error) {
          if (error.response && error.response.data) toast.error(error.response.data); 
          else toast.error("Eroare la înscriere.");
      } finally {
          setPurchasingId(null);
      }
  };

  const handleLogout = () => {
      localStorage.removeItem('user');
      navigate('/');
  };

  
  useEffect(() => {
    if (!user) return;
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events'); 
        setEvents(response.data);
        setFilteredEvents(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [user]);

  
  const uniqueLocations = useMemo(() => [...new Set(events.map(e => e.location))].filter(Boolean), [events]);
  const uniqueCategories = useMemo(() => [...new Set(events.map(e => e.category))].filter(Boolean), [events]);
  const uniqueOrganizers = useMemo(() => [...new Set(events.map(e => e.organizer ? `${e.organizer.firstName} ${e.organizer.lastName}` : ''))].filter(Boolean), [events]);

  useEffect(() => {
    const results = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = filters.location ? event.location === filters.location : true; 
      const matchesCategory = filters.category ? event.category === filters.category : true;
      const organizerName = event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : '';
      const matchesOrganizer = filters.organizer ? organizerName === filters.organizer : true;
      return matchesSearch && matchesLocation && matchesCategory && matchesOrganizer;
    });
    setFilteredEvents(results);
  }, [searchTerm, filters, events]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

 
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
        
        const dayEvent = events.find(evt => {
            const eventDate = new Date(evt.startTime);
            return eventDate.getDate() === date.getDate() &&
                   eventDate.getMonth() === date.getMonth() &&
                   eventDate.getFullYear() === date.getFullYear();
        });

        if (dayEvent) {
           
            return (
                <div 
                    className="day-highlight-circle"
                    style={{ backgroundColor: CATEGORY_COLORS[dayEvent.category] || CATEGORY_COLORS.OTHER }}
                >
                </div>
            );
        }
    }
    return null;
  };

  if (!user) return null;

  return (
    <div className="home-container">
     
      {showCalendar && (
        <div className="calendar-modal-overlay" onClick={() => setShowCalendar(false)}>
            <div className="calendar-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="calendar-header-row">
                    <h3>Calendar Evenimente</h3>
                    <button className="close-calendar-btn" onClick={() => setShowCalendar(false)}>×</button>
                </div>
                
                <Calendar 
                    onChange={setDate} 
                    value={date} 
                    tileContent={tileContent}
                    className="custom-calendar-large"
                />

                <div className="calendar-legend">
                    <small style={{color: CATEGORY_COLORS.SOCIAL}}>● Social</small>
                    <small style={{color: CATEGORY_COLORS.SPORT}}>● Sport</small>
                    <small style={{color: CATEGORY_COLORS.ACADEMIC}}>● Academic</small>
                    <small style={{color: CATEGORY_COLORS.CULTURAL}}>● Cultural</small>
                </div>
            </div>
        </div>
      )}

     
      <div className="Header">
        <h1 className="logo-text">Event Manager</h1>
        <div className="header-right">
            <div className="notification-wrapper">
                 <NotificationBell /> 
            </div>
            <div className="profile-container" ref={dropdownRef}>
                <div className="profile-pill" onClick={() => setShowDropdown(!showDropdown)}>
                    <div className="avatar-circle">
                         {user.firstName.charAt(0)}
                    </div> 
                    <span className="user-name">{user.firstName} {user.lastName}</span>
                </div>
                {showDropdown && (
                    <div className="dropdown-menu" style={{border:"solid 2px #b8b7b7ff"}}>
                        <div className="dropdown-header">
                            <p className="dd-name" style={{fontSize:"20px"}}>{user.firstName} {user.lastName}</p>
                            <p className="dd-email" style={{fontSize:"20px"}}>{user.email || 'user@student.usv.ro'}</p>
                        </div>
                        <div className="dropdown-divider"></div>
                        <ul className="dropdown-list">
                            {user.role === 'ADMIN' && (
                                <li onClick={() => navigate('/admin')}>
                                    <span className="dd-icon"><img src={shield} alt="Shield" /></span> Panou Admin
                                </li>
                            )}
                        <div className="dropdown-divider"></div>
                            {user.role === 'ORGANIZER' && (
                                <li onClick={() => navigate('/organizer')}>
                                    <span className="dd-icon"><img src={organizer} alt="Organizer" /></span> Gestionează Evenimente
                                </li>
                            )}
                            {user.role === 'STUDENT' && (
                                <li onClick={() => navigate('/my-tickets')}>
                                    <span className="dd-icon"><img src={ticket} alt="Ticket" /></span> Biletele mele
                                </li>
                            )}
                            <li onClick={() => navigate('/favorites')}>
                                <span className="dd-icon"><img src={heart} alt="Heart" /></span> Favoritele mele
                            </li>
                        <div className="dropdown-divider"></div>
                            <li>
                                <span className="dd-icon"><img src={setings} alt="Settings" /></span> Setări
                            </li>
                        </ul>
                        <div className="dropdown-divider"></div>
                        <div className="dropdown-footer" onClick={handleLogout}>
                            <span className="dd-icon-logout"><img src={logout} alt="Logout" /></span> Deconectare
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

    
      <div className="search-section">
        <div className="search-bar" style={{border:"solid 1px black"}}>
          <img src={SearchIcon} className="search-icon" alt="" />
          <input style={{background:"white", border:"none"} }
            type="text" 
            placeholder="Scrie aici..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      
      <div className="filters-section">
        <select name="organizer" className="filter-pill" onChange={handleFilterChange} style={{border:"solid 1px black"}}>
            <option value="">Organizator</option>
            {uniqueOrganizers.map(org => (<option key={org} value={org}>{org}</option>))}
        </select>
        <select name="location" className="filter-pill" onChange={handleFilterChange} style={{border:"solid 1px black"}}>
            <option value="">Locație</option>
            {uniqueLocations.map(loc => (<option key={loc} value={loc}>{loc}</option>))}
        </select>
        <select name="category" className="filter-pill" onChange={handleFilterChange} style={{border:"solid 1px black"}}>
            <option value="">Tip eveniment</option>
            {uniqueCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>)) }
        </select>

        
        <div className="calendar-wrapper">
            <button 
                className="calendar-btn" 
                onClick={() => setShowCalendar(true)}
                title="Vezi Calendar"
            >
                <img src={calendarIcon} alt="Calendar" style={{width: '20px', height: '20px'}} />
            </button>
        </div>
      </div>

      
      <div className="events-grid">
          {loading ? (
             <p className="loading-text">Se încarcă evenimentele...</p>
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
                    organizer={event.organizer} 
                    userRole={user.role}
                    onBuyTicket={() => handleBuyTicket(event.id, event.title)}
                    isPurchasing={purchasingId === event.id}
                />
             ))
          ) : (
             <p className="no-events-text">Nu am găsit evenimente.</p>
          )}
      </div>
    </div>
  );
}

export default Home;