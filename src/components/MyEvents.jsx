import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PlusCircle, Calendar, Edit2, Trash2, Eye, MapPin, Users, Clock, CheckCircle2, Hourglass, BarChart3, Search, AlertCircle, MessageSquare, Download, Send, Star, X, Info, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModal from './ui/ConfirmationModal';
import ParticipantsModal from './ParticipantsModal';

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000&auto=format&fit=crop";

const MyEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Modals State
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isParticipantsModalOpen, setParticipantsModalOpen] = useState(false);
    const [isReviewsModalOpen, setReviewsModalOpen] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => {},
        isDanger: false
    });

    const openConfirmModal = (title, message, onConfirm, isDanger = false) => {
        setModalConfig({ title, message, onConfirm, isDanger });
        setIsModalOpen(true);
    };

    const fetchReviews = async (eventId) => {
        try {
            const response = await api.get(`/reviews/event/${eventId}`);
            setReviews(Array.isArray(response.data) ? response.data : []);
            setReviewsModalOpen(true);
        } catch (error) {
            toast.error("Could not load reviews.");
        }
    };

    useEffect(() => {
        const fetchMyEvents = async () => {
            try {
                const response = await api.get('/events/my-events');
                setEvents(response.data);
            } catch (error) {
                console.error("Error loading my events:", error);
                toast.error("Could not load your events.");
            } finally {
                setLoading(false);
            }
        };
        fetchMyEvents();
    }, []);

    const handleDelete = (id) => {
        openConfirmModal(
            "Șterge Eveniment",
            "Ești sigur că vrei să ștergi acest eveniment? Această acțiune nu poate fi anulată.",
            async () => {
                try {
                    await api.delete(`/events/${id}`);
                    setEvents(events.filter(e => e.id !== id));
                    toast.success("Eveniment șters cu succes!");
                } catch (error) {
                    console.error(error);
                    toast.error("Nu s-a putut șterge evenimentul.");
                }
            },
            true
        );
    };

    // Calculate Stats
    const totalEvents = events.length;
    const publishedEvents = events.filter(e => e.status === 'PUBLISHED').length;
    const pendingEvents = events.filter(e => e.status === 'PENDING').length;
    const rejectedEvents = events.filter(e => e.status === 'REJECTED').length;
    const totalParticipants = events.reduce((acc, curr) => acc + (curr.participantCount || 0), 0);
    const globalRating = events.filter(e => e.averageRating > 0).length > 0 
        ? (events.reduce((acc, curr) => acc + (curr.averageRating || 0), 0) / events.filter(e => e.averageRating > 0).length).toFixed(1)
        : 'N/A';

    const getStatusStyles = (status) => {
        switch (status) {
            case 'PUBLISHED':
                return 'bg-green-500/90 text-white border-green-400';
            case 'PENDING':
                return 'bg-amber-400/90 text-white border-amber-300';
            case 'REJECTED':
                return 'bg-red-500/90 text-white border-red-400';
            default:
                return 'bg-gray-400/90 text-white border-gray-300';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PUBLISHED': return 'Publicat';
            case 'PENDING': return 'În aprobare';
            case 'REJECTED': return 'Respins';
            default: return status;
        }
    };

    const filteredEvents = events.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                <p className="text-gray-500 font-medium">Se încarcă evenimentele...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent pb-20">
            <ConfirmationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                isDanger={modalConfig.isDanger}
                confirmText="Șterge"
                cancelText="Anulează"
            />

            {/* Dashboard Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Evenimentele Mele</h1>
                            <p className="text-gray-500 font-medium mt-1">Gestionează și monitorizează activitatea experiențelor create de tine.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link to="/create-event" className="no-underline">
                                <button className="bg-gradient-to-r from-primary to-orange-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 group border-none cursor-pointer uppercase tracking-widest">
                                    <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                    <span>Creează Eveniment</span>
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
                        {[
                            { label: 'Total', value: totalEvents, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Publicate', value: publishedEvents, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                            { label: 'Pending', value: pendingEvents, icon: Hourglass, color: 'text-amber-600', bg: 'bg-amber-50' },
                            { label: 'Respinse', value: rejectedEvents, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                            { label: 'Participanți', value: totalParticipants, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                            { label: 'Rating', value: globalRating, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50', isStar: true }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md group">
                                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`w-6 h-6 ${stat.isStar ? 'fill-current' : ''}`} />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 leading-none">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* Search Bar - Premium */}
                <div className="mb-12 relative max-w-xl group">
                    <div className="absolute inset-0 bg-orange-200/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center bg-white border-2 border-orange-100/50 rounded-2xl shadow-sm group-focus-within:border-primary/30 group-focus-within:shadow-xl transition-all duration-300">
                        <Search className="absolute left-5 text-orange-500 h-5 w-5" />
                        <input 
                            type="text" 
                            placeholder="Caută în evenimentele tale..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-transparent border-none text-gray-800 placeholder:text-gray-400 focus:ring-0 text-sm font-medium outline-none"
                        />
                    </div>
                </div>

                {events.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Nu ai creat niciun eveniment</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">Începe să creezi evenimente pentru a le vedea aici și pentru a le gestiona.</p>
                        <Link to="/create-event">
                            <button className="text-primary font-bold hover:underline bg-primary/5 px-6 py-2 rounded-full hover:bg-primary/10 transition-colors">
                                Creează primul eveniment
                            </button>
                        </Link>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Nu am găsit evenimente care să corespundă căutării.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((event, index) => (
                            <motion.div 
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col h-full"
                            >
                                {/* Image & Status */}
                                <div className="relative h-48 bg-gray-50 overflow-hidden">
                                    <img 
                                        src={event.imageUrl || PLACEHOLDER_IMAGE} 
                                        alt={event.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                                         <span className={`
                                            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/20
                                            ${getStatusStyles(event.status)}
                                         `}>
                                            {event.status === 'PUBLISHED' ? <CheckCircle2 className="w-3 h-3" /> : <Hourglass className="w-3 h-3" />}
                                            {getStatusLabel(event.status)}
                                        </span>
                                        <span className="bg-white/90 backdrop-blur-md text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/20">
                                            {event.category}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Content */}
                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h3>
                                    
                                    <div className="space-y-2.5 mb-6 text-sm text-gray-500">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-primary/60" />
                                            <span className="font-medium">{new Date(event.startTime).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-primary/60" />
                                            <span className="font-medium">{new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-4 h-4 text-primary/60" />
                                            <span className="font-medium truncate">{event.location}</span>
                                        </div>
                                    </div>

                                    {/* Metrics Row */}
                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50 mb-6">
                                        <div className="text-center">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ocupare</p>
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                                                    <span>{event.participantCount}</span>
                                                    <span className="text-gray-300">/</span>
                                                    <span className="text-gray-400">{event.maxCapacity}</span>
                                                </div>
                                                <div className="h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${Math.min((event.participantCount / event.maxCapacity) * 100, 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center border-l border-gray-100">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                                            <div className="flex items-center justify-center gap-1.5 text-yellow-500">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="text-sm font-bold text-gray-900">{event.averageRating ? event.averageRating.toFixed(1) : 'N/A'}</span>
                                                <span className="text-[10px] text-gray-400">({event.reviewCount})</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <button 
                                            onClick={() => { setSelectedEvent(event); setParticipantsModalOpen(true); }}
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-100"
                                        >
                                            <Users size={14} /> Participanți
                                        </button>
                                        <button 
                                            onClick={() => { setSelectedEvent(event); fetchReviews(event.id); }}
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-purple-600 bg-purple-50 hover:bg-purple-100 transition-all border border-purple-100"
                                        >
                                            <MessageSquare size={14} /> Recenzii
                                        </button>
                                    </div>

                                    {/* Edit / Delete Row */}
                                    <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-50">
                                        <button 
                                            onClick={() => navigate(`/edit-event/${event.id}`)}
                                            className="flex-grow flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-white hover:border-primary hover:text-primary transition-all group/edit"
                                        >
                                            <Edit2 size={14} className="group-hover/edit:rotate-12 transition-transform" /> Editează
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(event.id)}
                                            className="p-2.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                            title="Șterge"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            {/* Participants Modal */}
            <AnimatePresence>
                {isParticipantsModalOpen && selectedEvent && (
                    <ParticipantsModal 
                        event={selectedEvent} 
                        onClose={() => setParticipantsModalOpen(false)} 
                    />
                )}
            </AnimatePresence>

            {/* Reviews Modal */}
            <AnimatePresence>
                {isReviewsModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.95 }} 
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-white/20"
                        >
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">Feedback Studenți</h3>
                                    <p className="text-gray-500 font-medium text-sm mt-1">Recenzii primite la eveniment</p>
                                </div>
                                <button onClick={() => setReviewsModalOpen(false)} className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-400 shadow-sm">
                                            <Star className="w-10 h-10 fill-current" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">Nicio recenzie încă</h4>
                                        <p className="text-gray-500 font-medium text-sm">Feedback-ul studenților va apărea aici după eveniment.</p>
                                    </div>
                                ) : (
                                    reviews.map(rev => (
                                        <div key={rev.id} className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-lg hover:border-gray-200 transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-2xl flex items-center justify-center text-primary font-black text-lg shadow-inner">
                                                        {rev.userName ? rev.userName[0].toUpperCase() : 'U'}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-gray-900 text-base leading-tight">{rev.userName || 'Student Anonim'}</h5>
                                                        <span className="text-xs font-medium text-gray-400">{new Date(rev.createdAt).toLocaleDateString('ro-RO')}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
                                                    <span className="text-sm font-black text-yellow-600">{rev.rating}.0</span>
                                                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                                </div>
                                            </div>
                                            <div className="relative pl-4 border-l-2 border-primary/20">
                                                <p className="text-gray-600 text-sm leading-relaxed italic font-medium">"{rev.comment}"</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyEvents;

