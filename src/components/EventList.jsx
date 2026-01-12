import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import EventCard from './EventCard';
import CalendarWidget from './CalendarWidget';
import { Search, Filter, Calendar as CalendarIcon, MapPin, Building2, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isSameDay, parseISO } from 'date-fns';

// Skeleton Component
const EventSkeleton = () => (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm h-full flex flex-col">
        <div className="h-56 bg-gray-100 animate-pulse"></div>
        <div className="p-6 flex-grow space-y-4">
            <div className="h-6 w-3/4 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse"></div>
            <div className="space-y-2 pt-2">
                <div className="h-3 w-full bg-gray-100 rounded animate-pulse"></div>
                <div className="h-3 w-5/6 bg-gray-100 rounded animate-pulse"></div>
            </div>
        </div>
    </div>
);

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    
    // State for filters
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedOrganizer, setSelectedOrganizer] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    
    // Dropdown States
    const [showOrganizer, setShowOrganizer] = useState(false);
    const [showLocation, setShowLocation] = useState(false);
    const [showCategory, setShowCategory] = useState(false);

    // Dynamic Options
    const [uniqueLocations, setUniqueLocations] = useState([]);
    const [uniqueOrganizers, setUniqueOrganizers] = useState([]);
    const [uniqueCategories, setUniqueCategories] = useState([]);

    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/events');
            if (Array.isArray(response.data)) {
                setEvents(response.data);
                
                // Extract unique values for filters
                const locs = [...new Set(response.data.map(e => e.location).filter(Boolean))].sort();
                const orgs = [...new Set(response.data.map(e => e.organizer?.organizationName || "Unknown").filter(Boolean))].sort();
                const cats = [...new Set(response.data.map(e => e.category).filter(Boolean))].sort();
                
                setUniqueLocations(locs);
                setUniqueOrganizers(orgs);
                setUniqueCategories(cats);
            } else {
                setEvents([]);
            }
        } catch (error) {
            console.error("Error loading events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Filter Logic
    const filteredEvents = events.filter(event => {
        const matchesSearch = 
            (event.title && event.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesOrganizer = !selectedOrganizer || (event.organizer?.organizationName === selectedOrganizer);
        const matchesLocation = !selectedLocation || (event.location === selectedLocation);
        const matchesCategory = !selectedCategory || (event.category === selectedCategory);
        
        const matchesDate = !selectedDate || (event.startTime && (() => {
            try {
                const eventDate = typeof event.startTime === 'string' ? parseISO(event.startTime) : new Date(event.startTime);
                const filterDate = new Date(selectedDate);
                return isSameDay(eventDate, filterDate);
            } catch (e) { return false; }
        })());

        return matchesSearch && matchesOrganizer && matchesLocation && matchesCategory && matchesDate;
    });

    return (
        <div className="min-h-screen bg-transparent pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                
                {/* Header Section */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                        Bine ai venit, <span className="text-blue-600">{user ? user.firstName : "Oaspete"}!</span>
                    </h1>

                    <p className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed">
                        Descoperă evenimente interesante și înscrie-te la activitățile tale preferate.
                    </p>
                </div>

                {/* Step 1: Clean Search Bar */}
                <div className="mb-10 max-w-4xl">
                    <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-1 focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-200 transition-all">
                        <Search className="text-gray-400 h-5 w-5 mr-3" />
                        <input 
                            type="text" 
                            placeholder="Caută evenimente, locații sau organizatori..." 
                            value={searchTerm}
                            spellCheck="false"
                            autoComplete="off"
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setSearchParams({ search: e.target.value });
                            }}
                            className="w-full py-3 bg-transparent text-gray-800 placeholder:text-gray-400 outline-none border-none focus:ring-0 text-base font-medium"
                        />
                    </div>
                </div>

                {/* Step 2: Refined Filters Row */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12"
                >
                    {/* Organizer Filter */}
                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Cine organizează</label>
                        <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4.5 w-4.5 group-focus-within:text-primary transition-colors z-10" />
                            <button 
                                onClick={() => { setShowOrganizer(!showOrganizer); setShowLocation(false); setShowCategory(false); setShowCalendar(false); }}
                                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border bg-white text-gray-700 text-sm font-medium transition-all hover:border-gray-300 hover:shadow-sm shadow-gray-100 flex items-center justify-between ${showOrganizer ? 'border-primary ring-4 ring-primary/5' : 'border-gray-200'}`}
                            >
                                <span className="truncate">{selectedOrganizer || "Toate facultățile"}</span>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${showOrganizer ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                        <AnimatePresence>
                            {showOrganizer && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                    className="absolute left-0 top-full mt-2 z-[50] w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                                >
                                    <div className="p-1">
                                        <button 
                                            onClick={() => { setSelectedOrganizer(""); setShowOrganizer(false); }}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${!selectedOrganizer ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            Toate facultățile
                                        </button>
                                        {uniqueOrganizers.map(org => (
                                            <button 
                                                key={org}
                                                onClick={() => { setSelectedOrganizer(org); setShowOrganizer(false); }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors truncate ${selectedOrganizer === org ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {org}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Location Filter */}
                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Unde se ține</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4.5 w-4.5 group-focus-within:text-primary transition-colors z-10" />
                            <button 
                                onClick={() => { setShowLocation(!showLocation); setShowOrganizer(false); setShowCategory(false); setShowCalendar(false); }}
                                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border bg-white text-gray-700 text-sm font-medium transition-all hover:border-gray-300 hover:shadow-sm shadow-gray-100 flex items-center justify-between ${showLocation ? 'border-primary ring-4 ring-primary/5' : 'border-gray-200'}`}
                            >
                                <span className="truncate">{selectedLocation || "Toate locațiile"}</span>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${showLocation ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                        <AnimatePresence>
                            {showLocation && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                    className="absolute left-0 top-full mt-2 z-[50] w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                                >
                                    <div className="p-1">
                                        <button 
                                            onClick={() => { setSelectedLocation(""); setShowLocation(false); }}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${!selectedLocation ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            Toate locațiile
                                        </button>
                                        {uniqueLocations.map(loc => (
                                            <button 
                                                key={loc}
                                                onClick={() => { setSelectedLocation(loc); setShowLocation(false); }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors truncate ${selectedLocation === loc ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {loc}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tip eveniment</label>
                        <div className="relative group">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4.5 w-4.5 group-focus-within:text-primary transition-colors z-10" />
                            <button 
                                onClick={() => { setShowCategory(!showCategory); setShowOrganizer(false); setShowLocation(false); setShowCalendar(false); }}
                                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border bg-white text-gray-700 text-sm font-medium transition-all hover:border-gray-300 hover:shadow-sm shadow-gray-100 flex items-center justify-between ${showCategory ? 'border-primary ring-4 ring-primary/5' : 'border-gray-200'}`}
                            >
                                <span className="truncate">{selectedCategory || "Toate tipurile"}</span>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${showCategory ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                        <AnimatePresence>
                            {showCategory && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                    className="absolute left-0 top-full mt-2 z-[50] w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                                >
                                    <div className="p-1">
                                        <button 
                                            onClick={() => { setSelectedCategory(""); setShowCategory(false); }}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${!selectedCategory ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            Toate tipurile
                                        </button>
                                        {uniqueCategories.map(cat => (
                                            <button 
                                                key={cat}
                                                onClick={() => { setSelectedCategory(cat); setShowCategory(false); }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors truncate ${selectedCategory === cat ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {cat.charAt(0) + cat.slice(1).toLowerCase()}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Date Filter */}
                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Data desfășurării</label>
                        <div className="relative group">
                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4.5 w-4.5 group-focus-within:text-primary transition-colors z-10" />
                            <button 
                                onClick={() => setShowCalendar(!showCalendar)}
                                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border bg-white text-gray-700 text-sm font-medium transition-all hover:border-gray-300 hover:shadow-sm shadow-gray-100 flex items-center justify-between ${showCalendar ? 'border-primary ring-4 ring-primary/5' : 'border-gray-200'}`}
                            >
                                <span>{selectedDate ? new Date(selectedDate).toLocaleDateString('ro-RO') : "Alege data"}</span>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* Dropdown Calendar */}
                        <AnimatePresence>
                            {showCalendar && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 z-[100] w-[280px] shadow-2xl shadow-gray-200"
                                >
                                    <CalendarWidget 
                                        events={events}
                                        selectedDate={selectedDate}
                                        onDateSelect={(d) => {
                                            setSelectedDate(d);
                                            setShowCalendar(false);
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Events Grid */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                                <EventSkeleton key={n} />
                            ))}
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-24 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Filter className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Nu am găsit evenimente</h3>
                            <p className="text-gray-500 text-sm mt-2">Încearcă să modifici filtrele sau termenii de căutare.</p>
                            <button 
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedOrganizer('');
                                    setSelectedLocation('');
                                    setSelectedCategory('');
                                    setSelectedDate('');
                                }}
                                className="mt-6 px-6 py-2 bg-white border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Resetează Filtrele
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredEvents.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="h-full"
                                >
                                    <EventCard event={event} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventList;