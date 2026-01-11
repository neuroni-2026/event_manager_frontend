import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from './EventCard';
import SearchIcon from '../Icons/icon-search.png';
import api from '../services/api'; 
import './Home.css';

import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; 
import { 
  Calendar as CalendarIcon, 
  Shield, 
  Briefcase, 
  MapPin, 
  Building2, 
  ChevronDown,
  Search
} from 'lucide-react';

import { toast } from 'react-hot-toast';

const CATEGORY_COLORS = {
  SOCIAL: '#ffcc00',    
  ACADEMIC: '#4a90e2',  
  VOLUNTEERING: '#e44d26',  
  SPORT: '#2ecc71',    
  CAREER: '#e67e22',  
  OTHER: '#95a5a6'       
};

const Home = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const [user, setUser] = useState(null); 
  const [events, setEvents] = useState([]);       
  const [filteredEvents, setFilteredEvents] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [date, setDate] = useState(new Date());

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    organizer: '',
    location: '',
    category: ''
  });

  // Încărcare date utilizator
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
        setUser({
          ...parsedUser,
          role: displayRole.replace('ROLE_', '') 
        });
    } catch (e) {
        localStorage.removeItem('user'); navigate('/');
    }
  }, [navigate]);

  // Fetch Evenimente
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

  // Generare opțiuni unice pentru filtre
  const uniqueLocations = useMemo(() => [...new Set(events.map(e => e.location))].filter(Boolean), [events]);
  const uniqueCategories = useMemo(() => [...new Set(events.map(e => e.category))].filter(Boolean), [events]);
  const uniqueOrganizers = useMemo(() => [...new Set(events.map(e => e.organizer ? `${e.organizer.firstName} ${e.organizer.lastName}` : ''))].filter(Boolean), [events]);

  // Logica de filtrare
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
                ></div>
            );
        }
    }
    return null;
  };

  if (!user) return null;

  return (
    <div className="home-container">
      {/* Modal Calendar */}
      {showCalendar && (
        <div className="calendar-modal-overlay" onClick={() => setShowCalendar(false)}>
            <div className="calendar-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="calendar-header-row">
                    <h3>Calendar Evenimente</h3>
                    <button className="close-calendar-btn" onClick={() => setShowCalendar(false)}>×</button>
                </div>
                <Calendar 
                    onChange={(val) => { setDate(val); setShowCalendar(false); }} 
                    value={date} 
                    tileContent={tileContent}
                    className="custom-calendar-large"
                />
            </div>
        </div>
      )}

      {/* Header Bun Venit */}
      <div className="home-header">
        <h1 className="welcome-text">
          Bine ai venit, <span className="user-highlight">{user.firstName}</span>!
        </h1>
        <p className="welcome-sub">Descoperă activitățile tale preferate în campusul USV.</p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
         <div className="search-bar-large" style={{padding:'25px'}}>
            <Search size={25} color="#e49750"/>
            <input 
                type="text" 
                placeholder="Caută evenimente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value) }
                style={{fontSize:'20px'}}
                
            />
            
        </div>
      </div>

      {/* FILTRE MODERNE RESPONSIVE */}
      <div className="filters-section-modern">
        <div className="filter-box-modern">
          <label className="filter-label-top">CINE ORGANIZEAZĂ</label>
          <div className="filter-input-wrapper">
            <Building2 size={18} className="filter-icon-inline" />
            <select name="organizer" className="filter-select-actual" onChange={handleFilterChange}>
              <option value="">Toate facultățile</option>
              {uniqueOrganizers.map(org => (<option key={org} value={org} >{org}</option>))}
            </select>
            <ChevronDown size={16} className="filter-chevron" />
          </div>
        </div>

        <div className="filter-box-modern">
          <label className="filter-label-top">UNDE SE ȚINE</label>
          <div className="filter-input-wrapper">
            <MapPin size={18} className="filter-icon-inline" />
            <select name="location" className="filter-select-actual" onChange={handleFilterChange}>
              <option value="" >Toate locațiile</option>
              {uniqueLocations.map(loc => (<option key={loc} value={loc}>{loc}</option>))}
            </select>
            <ChevronDown size={16} className="filter-chevron" />
          </div>
        </div>

        <div className="filter-box-modern">
          <label className="filter-label-top">TIP EVENIMENT</label>
          <div className="filter-input-wrapper">
            <Shield size={18} className="filter-icon-inline" />
            <select name="category" className="filter-select-actual" onChange={handleFilterChange}>
              <option value="">Toate tipurile</option>
              {uniqueCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
            <ChevronDown size={16} className="filter-chevron" />
          </div>
        </div>

        <div className="filter-box-modern" onClick={() => setShowCalendar(true)}>
          <label className="filter-label-top">DATA DESFĂȘURĂRII</label>
          <div className="filter-input-wrapper pointer">
            <CalendarIcon size={18} className="filter-icon-inline" />
            <span className="filter-display-text">Alege data</span>
            <ChevronDown size={16} className="filter-chevron" />
          </div>
        </div>
      </div>

      {/* Grid Evenimente */}
      <div className="events-grid-large">
          {loading ? (
             <p className="status-text">Se încarcă...</p>
          ) : filteredEvents.length > 0 ? (
             filteredEvents.map((event) => (
                <EventCard 
                    key={event.id}
                    {...event}
                    date={event.startTime}
                />
             ))
          ) : (
             <p className="status-text">Nu am găsit evenimente.</p>
          )}
      </div>
    </div>
  );
}

export default Home;