import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import EventReviews from './EventReviews';
import { toast } from 'sonner';
import { Calendar, MapPin, User, Users, ArrowLeft, Heart, Ticket, Clock, Share2, Globe, FileText, Download, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ConfirmationModal from './ui/ConfirmationModal';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [hasTicket, setHasTicket] = useState(false);

  
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => {},
        isDanger: false,
        confirmText: 'Confirm'
    });

    const openConfirmModal = (title, message, onConfirm, isDanger = false, confirmText = 'Confirm') => {
        setModalConfig({ title, message, onConfirm, isDanger, confirmText });
        setIsModalOpen(true);
    };

    const user = JSON.parse(localStorage.getItem('user'));
    const isStudent = user && user.roles.includes('ROLE_STUDENT');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await api.get(`/events/${id}`);
                setEvent(response.data);
                
                if (isStudent) {
                    try {
                        const favRes = await api.get(`/favorites/check/${id}`);
                        setIsFavorite(favRes.data);
                    } catch (e) {
                        console.warn("Could not check favorite status.");
                    }

                    try {
                        const ticketsRes = await api.get('/tickets/my-tickets');
                        console.log("My Tickets:", ticketsRes.data); 
                        const ticketExists = ticketsRes.data.some(t => 
                            (t.eventId === parseInt(id)) || 
                            (t.event && t.event.id === parseInt(id)) ||
                            (t.event_id === parseInt(id)) ||
                            (t.eventTitle === response.data.title) 
                        );
                        setHasTicket(ticketExists);
                    } catch (e) {
                        console.warn("Could not check ticket status.", e);
                    }
                }

            } catch (err) {
                setError("Could not load event details.");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, isStudent]);

    const handleBuyTicket = () => {
        if (hasTicket) {
            navigate('/my-tickets');
            return;
        }

        openConfirmModal(
            "Rezervare Bilet",
            `Ești sigur că vrei să rezervi un loc la evenimentul "${event.title}"?`,
            async () => {
                try {
                    await api.post('/tickets', { eventId: event.id });
                    toast.success("Bilet rezervat cu succes! Verifică portofelul.");
                    setHasTicket(true);
                    navigate('/my-tickets'); 
                } catch (err) {
                    toast.error(err.response?.data?.message || "Eroare la rezervare.");
                }
            },
            false,
            "Rezervă Acum"
        );
    };

    const toggleFavorite = async () => {
        try {
            if (isFavorite) {
                await api.delete(`/favorites/${event.id}`);
                setIsFavorite(false);
                toast.success("Removed from favorites.");
            } else {
                await api.post(`/favorites/${event.id}`);
                setIsFavorite(true);
                toast.success("Added to favorites!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating favorites.");
        }
    };

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary border-t-transparent"></div>
                <span className="text-gray-500 font-medium animate-pulse">Loading experience...</span>
            </div>
        </div>
    );

    if (error || !event) return (
        <div className="container mx-auto mt-20 px-4 text-center">
            <div className="text-red-500 mb-4 font-medium bg-red-50 p-4 rounded-xl inline-block">{error || "Event not found."}</div>
            <br />
            <button className="text-primary hover:underline font-semibold" onClick={() => navigate('/events')}>
                Back to Events
            </button>
        </div>
    );

    const dateObj = new Date(event.startTime);
    const isExpired = new Date() > dateObj;

    return (
        <div className="min-h-screen bg-background pb-20">
            <ConfirmationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                isDanger={modalConfig.isDanger}
                confirmText={modalConfig.confirmText}
                cancelText="Anulează"
            />
            
     
            <div className="relative h-[50vh] min-h-[400px] w-full bg-gray-900 overflow-hidden">
                <img 
                    src={event.imageUrl || "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000&auto=format&fit=crop"} 
                    alt={event.title}
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 pb-16 max-w-7xl mx-auto flex flex-col justify-end h-full">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest shadow-lg mb-4">
                            {event.category}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-sm max-w-4xl">
                            {event.title}
                        </h1>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* LEFT COLUMN: Main Content*/}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Organizer */}
                        <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-300 bg-card p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3 pr-6 border-r border-gray-100 dark:border-gray-800">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                                    {event.organizer ? event.organizer.firstName?.[0] : 'U'}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Organizator</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : "Unknown"}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl"><Calendar className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Data</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{dateObj.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl"><Clock className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Ora</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pl-6 border-l border-gray-100 dark:border-gray-800">
                                <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl"><MapPin className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Locație</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{event.location}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-card rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 dark:border-gray-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                                Despre Eveniment
                            </h3>
                            <div className="prose prose-lg text-gray-600 dark:text-gray-300 max-w-none leading-relaxed whitespace-pre-line font-medium">
                                {event.description}
                            </div>
                        </div>

                        {/* Materials */}
                        {event.materials && event.materials.length > 0 && (
                            <div className="bg-card rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Download className="w-5 h-5 text-gray-400" /> Resurse Atașate
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {event.materials.map((material) => (
                                        <button
                                            key={material.id}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toast.info("Se descarcă...");
                                                fetch(material.fileUrl)
                                                    .then(res => res.blob())
                                                    .then(blob => {
                                                        const url = window.URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.style.display = 'none';
                                                        a.href = url;
                                                        a.download = material.fileName || "document"; 
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        window.URL.revokeObjectURL(url);
                                                    });
                                            }}
                                            className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-all text-left w-full"
                                        >
                                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">{material.fileName}</p>
                                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">Descarcă</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        <div className="bg-card rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                            <EventReviews eventId={event.id} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar Action*/}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-card rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-800 sticky top-28">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Rezervă un loc</h3>
                            
                            <div className="space-y-6">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Grad Ocupare</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{event.participantCount || 0} / {event.maxCapacity}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary rounded-full transition-all duration-1000" 
                                            style={{ width: `${Math.min(((event.participantCount || 0) / event.maxCapacity) * 100, 100)}%` }} 
                                        />
                                    </div>
                                </div>

                                {isStudent ? (
                                    <button 
                                        onClick={handleBuyTicket}
                                        disabled={isExpired}
                                        className={`w-full font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group ${
                                            isExpired
                                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none'
                                                : hasTicket 
                                                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200 dark:shadow-green-900/20 active:scale-95 hover:-translate-y-0.5'
                                                    : 'bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white shadow-primary/20 hover:shadow-primary/30 active:scale-95 hover:-translate-y-0.5'
                                        }`}
                                    >
                                        <span>{isExpired ? "Eveniment Încheiat" : (hasTicket ? "Vezi Biletul" : "Rezervă Locul")}</span>
                                        {!isExpired && (hasTicket ? (
                                            <Ticket className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        ) : (
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        ))}
                                    </button>
                                ) : (
                                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl text-center text-sm text-gray-500 dark:text-gray-400 font-medium border border-gray-200 dark:border-gray-700">
                                        {!user ? (
                                            <p>Te rugăm să te <a href="/login" className="text-primary hover:underline font-bold">autentifici</a> pentru a rezerva.</p>
                                        ) : (
                                            <p>Doar studenții pot rezerva locuri.</p>
                                        )}
                                    </div>
                                )}

                                {isStudent && (
                                    <button 
                                        onClick={toggleFavorite}
                                        className={`w-full py-3.5 rounded-2xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                                            isFavorite 
                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/30' 
                                                : 'bg-card text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                    >
                                        <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                                        <span>{isFavorite ? 'Salvat la Favorite' : 'Adaugă la Favorite'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EventDetails;