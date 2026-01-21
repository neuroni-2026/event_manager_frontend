import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
    Check, X, Shield, User, Users, Calendar, MapPin, 
    AlertCircle, Briefcase, Ban, Timer, UserMinus, Clock, AlertTriangle, Eye, DollarSign,
    TrendingUp, BarChart3, PieChart, Activity, Star, Layers, MessageSquare, Trash2, Download, Loader2,
    Ticket, CheckCircle2, PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-800"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-500">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title || "Confirmare"}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">{message || "Ești sigur?"}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={onCancel} className="px-4 py-2 text-gray-600 dark:text-gray-400 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Anulează</button>
                            <button onClick={onConfirm} className="px-6 py-2 bg-yellow-500 text-white rounded-xl font-bold shadow-lg hover:bg-yellow-600 transition-colors">Confirmă</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000&auto=format&fit=crop";

const PreviewModal = ({ event, onClose }) => {
    if (!event) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('ro-RO', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleTimeString('ro-RO', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[75vh] flex flex-col overflow-hidden relative ring-1 ring-black/5 dark:ring-white/10"
                >
                    <button 
                        onClick={onClose} 
                        className="absolute top-6 right-6 z-50 p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full transition-all border border-white/20 shadow-lg active:scale-90"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    {/* Scrollable Content */}
                    <div className="overflow-y-auto flex-grow custom-scrollbar">
                        {/* Header Image Section */}
                        <div className="relative h-72 shrink-0">
                            <img 
                                src={event.imageUrl || PLACEHOLDER_IMAGE} 
                                alt={event.title} 
                                className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end">
                                <div className="flex flex-wrap gap-1.5 mb-1.5">
                                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-[12px] font-black uppercase tracking-widest rounded-xl border border-white/10 shadow-sm">
                                        {event.category}
                                    </span>
                                    {event.maxCapacity && (
                                        <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-[12px] font-black uppercase tracking-widest rounded-xl border border-white/10 flex items-center gap-1.5 shadow-sm">
                                            <User className="w-3.5 h-3.5" /> {event.maxCapacity} locuri
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-3xl md:text-4xl font-semibold text-white leading-tight drop-shadow-lg tracking-tight">{event.title}</h2>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="p-8 space-y-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-blue-100 dark:border-blue-900/30 group-hover:scale-105 transition-transform">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Perioadă</p>
                                            <p className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">{formatDate(event.startTime)}</p>
                                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                                                {formatTime(event.startTime)} — {formatTime(event.endTime)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-red-100 dark:border-red-900/30 group-hover:scale-105 transition-transform">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Locație</p>
                                            <p className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">{event.location}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-purple-100 dark:border-purple-900/30 group-hover:scale-105 transition-transform">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Organizator</p>
                                            <p className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                                                {event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : (event.organizerName || 'N/A')}
                                            </p>
                                            {event.organizer?.organizationName && (
                                                <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-1 uppercase tracking-wide">{event.organizer.organizationName}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-green-100 dark:border-green-900/30 group-hover:scale-105 transition-transform">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Acces</p>
                                            <p className="font-semibold text-gray-900 dark:text-white text-xl leading-tight">
                                                {event.ticketPrice > 0 ? `${event.ticketPrice} RON` : 'LIBER'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-gray-800" />

                            {/* Description */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    Descriere Eveniment
                                </h4>
                                <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-base font-normal">
                                    {event.description}
                                </div>
                            </div>

                            {/* Materials */}
                            {event.materials && event.materials.length > 0 && (
                                <div className="pb-4">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                        Materiale Atașate
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {event.materials.map((mat) => (
                                            <a 
                                                key={mat.id} 
                                                href={mat.fileUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-white dark:hover:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-900 hover:shadow-lg transition-all duration-300 group"
                                            >
                                                <div className="w-10 h-10 bg-card text-gray-400 dark:text-gray-500 rounded-xl flex items-center justify-center group-hover:text-blue-600 dark:group-hover:text-blue-400 shadow-sm transition-colors shrink-0">
                                                    <Briefcase className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{mat.fileName || 'Document Fără Titlu'}</p>
                                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest mt-0.5">Vezi Fișier</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-card border-t border-gray-100 dark:border-gray-800 flex justify-end shrink-0">
                        <button 
                            onClick={onClose} 
                            className="w-full py-3.5 bg-gradient-to-r from-primary to-orange-600 text-white font-semibold text-sm transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-95 border-none cursor-pointer rounded-2xl"
                        >
                            Închide Previzualizarea
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState([]);
    const [organizerRequests, setOrganizerRequests] = useState([]);
    const [organizersStats, setOrganizerStats] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [allReviews, setAllReviews] = useState([]);
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const navigate = useNavigate();

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [eventRejectModalOpen, setEventRejectModalOpen] = useState(false);
    const [suspendModalOpen, setSuspendModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [suspendDays, setSuspendDays] = useState(7);
    const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const [previewEvent, setPreviewEvent] = useState(null);


    const downloadCSV = (data, filename) => {
        if (!data || data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(fieldName => {
                const value = row[fieldName] === null || row[fieldName] === undefined ? '' : row[fieldName];
                return `"${value.toString().replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportUsers = () => {
        const dataToExport = allUsers.map(u => ({
            ID: u.id,
            Email: u.email,
            Prenume: u.firstName,
            Nume: u.lastName,
            Rol: u.role,
            Activ: u.isEnabled !== false ? 'DA' : 'NU',
            CreatLa: u.createdAt
        }));
        downloadCSV(dataToExport, `utilizatori_eventmanager_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const exportOrganizers = () => {
        const dataToExport = organizersStats.map(o => ({
            ID: o.id,
            Nume: `${o.firstName} ${o.lastName}`,
            Organizatie: o.organizationName,
            Evenimente: o.eventCount,
            Rating: o.averageRating || 'N/A',
            UltimulEvent: o.lastEventDate || 'N/A'
        }));
        downloadCSV(dataToExport, `organizatori_eventmanager_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const exportFullReport = () => {
        if (!reports) return;
        
        const summaryData = [
            { Sectiune: 'METRICI GENERALE', Item: 'Total Evenimente', Valoare: reports.totalEvents },
            { Sectiune: 'METRICI GENERALE', Item: 'Utilizatori Totali', Valoare: reports.totalUsers },
            { Sectiune: 'METRICI GENERALE', Item: 'Rezervari Medii / Event', Valoare: reports.averageParticipation.toFixed(2) },
            { Sectiune: 'METRICI GENERALE', Item: 'Evenimente in Asteptare', Valoare: reports.pendingEvents },
            { Sectiune: '', Item: '', Valoare: '' },
            { Sectiune: 'DISTRIBUTIE CATEGORII', Item: '', Valoare: '' },
            ...Object.entries(reports.eventsByCategory).map(([cat, count]) => ({
                Sectiune: 'CATEGORIE',
                Item: cat,
                Valoare: count
            })),
            { Sectiune: '', Item: '', Valoare: '' },
            { Sectiune: 'ACTIVITATE LUNARA', Item: '', Valoare: '' },
            ...Object.entries(reports.eventsByMonth).map(([month, count]) => ({
                Sectiune: 'LUNA',
                Item: month,
                Valoare: count
            }))
        ];
        
        downloadCSV(summaryData, `raport_global_eventmanager_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'events') {
                const response = await api.get('/admin/pending-events');
                setEvents(Array.isArray(response.data) ? response.data : []);
            } else if (activeTab === 'requests') {
                const response = await api.get('/admin/organizer-requests');
                setOrganizerRequests(Array.isArray(response.data) ? response.data : []);
            } else if (activeTab === 'manage') {
                const response = await api.get('/admin/organizers/stats');
                setOrganizerStats(Array.isArray(response.data) ? response.data : []);
            } else if (activeTab === 'users') {
                const response = await api.get('/admin/users');
                setAllUsers(Array.isArray(response.data) ? response.data : []);
            } else if (activeTab === 'all-events') {
                const response = await api.get('/admin/all-events');
                setAllEvents(Array.isArray(response.data) ? response.data : []);
            } else if (activeTab === 'reviews') {
                const response = await api.get('/admin/reviews');
                setAllReviews(Array.isArray(response.data) ? response.data : []);
            } else if (activeTab === 'reports') {
                const [reportsRes, organizersRes] = await Promise.all([
                    api.get('/admin/reports'),
                    api.get('/admin/organizers/stats')
                ]);
                setReports(reportsRes.data);
                setOrganizerStats(Array.isArray(organizersRes.data) ? organizersRes.data : []);
            }
        } catch (error) {
             if (error.response?.status === 403) {
                toast.error("Acces interzis. Nu ești Admin.");
                navigate('/');
            } else {
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleEventAction = (id, action) => {
        if (action === 'reject') {
            setSelectedEventId(id);
            setRejectReason('');
            setEventRejectModalOpen(true);
            return;
        }

        setDialog({
            isOpen: true,
            title: "Confirmare Aprobare",
            message: `Ești sigur că vrei să aprobi acest eveniment?`,
            onConfirm: async () => {
                setDialog({ isOpen: false });
                setProcessingId(id);
                try {
                    await api.put(`/admin/approve/${id}`);
                    toast.success("Eveniment aprobat!");
                    fetchData();
                } catch (error) {
                    toast.error("Acțiunea a eșuat.");
                } finally {
                    setProcessingId(null);
                }
            },
            onCancel: () => setDialog({ isOpen: false })
        });
    };

    const confirmRejectEvent = async () => {
        if (!rejectReason.trim()) {
            toast.error("Te rugăm să introduci un motiv.");
            return;
        }
        setProcessingId(selectedEventId);
        try {
            await api.put(`/admin/reject/${selectedEventId}`, null, { params: { reason: rejectReason } });
            toast.success("Eveniment respins. Organizatorul a fost notificat.");
            setEventRejectModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Eroare la respingere.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeleteEvent = (id) => {
        setDialog({
            isOpen: true,
            title: "Ștergere Eveniment",
            message: "Ești sigur că vrei să ștergi acest eveniment definitiv? Acțiunea este ireversibilă.",
            onConfirm: async () => {
                setDialog({ isOpen: false });
                setProcessingId(id);
                try {
                    await api.delete(`/admin/events/${id}`);
                    toast.success("Eveniment șters cu succes.");
                    fetchData();
                } catch (error) {
                    toast.error("Ștergerea a eșuat.");
                } finally {
                    setProcessingId(null);
                }
            },
            onCancel: () => setDialog({ isOpen: false })
        });
    };

    const handleDeleteReview = (id) => {
        setDialog({
            isOpen: true,
            title: "Ștergere Recenzie",
            message: "Ești sigur că vrei să ștergi această recenzie?",
            onConfirm: async () => {
                setDialog({ isOpen: false });
                setProcessingId(id);
                try {
                    await api.delete(`/admin/reviews/${id}`);
                    toast.success("Recenzie ștearsă.");
                    fetchData();
                } catch (error) {
                    toast.error("Acțiunea a eșuat.");
                } finally {
                    setProcessingId(null);
                }
            },
            onCancel: () => setDialog({ isOpen: false })
        });
    };

    const handleRequestAction = (userId, action) => {
        if (action === 'reject') {
            setSelectedUserId(userId);
            setRejectReason('');
            setRejectModalOpen(true);
            return;
        }
        
        setDialog({
            isOpen: true,
            title: "Confirmare Aprobare",
            message: "Ești sigur că vrei să aprobi acest utilizator ca organizator?",
            onConfirm: async () => {
                setDialog({ isOpen: false });
                setProcessingId(userId);
                try {
                    await api.post(`/admin/approve-organizer/${userId}`);
                    toast.success("Utilizator promovat la Organizator!");
                    fetchData();
                } catch (error) {
                    toast.error("Aprobarea a eșuat.");
                } finally {
                    setProcessingId(null);
                }
            },
            onCancel: () => setDialog({ isOpen: false })
        });
    };

    const confirmRejectRequest = async () => {
        if (!rejectReason.trim()) {
            toast.error("Te rugăm să introduci un motiv.");
            return;
        }
        setProcessingId(selectedUserId);
        try {
            await api.post(`/admin/reject-organizer/${selectedUserId}`, rejectReason, {
                headers: { 'Content-Type': 'text/plain' }
            });
            toast.success("Cerere respinsă. Organizatorul a fost notificat.");
            setRejectModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Eroare la respingere.");
        } finally {
            setProcessingId(null);
        }
    };
    
    const openSuspendModal = (org) => {
        setSelectedUserId(org.id);
        if (org.suspendedUntil && new Date(org.suspendedUntil) > new Date()) {
            setDialog({
                isOpen: true,
                title: "Anulare Suspendare",
                message: `Dorești să reactivezi contul pentru ${org.firstName}?`,
                onConfirm: async () => {
                    setDialog({ isOpen: false });
                    setProcessingId(org.id);
                    try {
                        await api.post(`/admin/organizers/${org.id}/unsuspend`);
                        toast.success("Suspendare anulată.");
                        fetchData();
                    } catch (e) { toast.error("Eroare la reactivare."); } finally { setProcessingId(null); }
                },
                onCancel: () => setDialog({ isOpen: false })
            });
        } else {
            setSuspendDays(7);
            setSuspendModalOpen(true);
        }
    };

    const handleModeration = (userId, action) => {
        const org = organizersStats.find(o => o.id == userId); 
        if (!org) return; 
        
        const actionConfig = {
            ban: { title: "Confirmare Ban", message: `Ești sigur că vrei să blochezi contul pentru ${org.firstName}?`, api: () => api.post(`/admin/organizers/${userId}/ban`), success: "Status actualizat!" },
            downgrade: { title: "Confirmare Retrogradare", message: `Sigur vrei să retrogradezi ${org.firstName} la rolul de Student?`, api: () => api.post(`/admin/organizers/${userId}/downgrade`), success: "Utilizator retrogradat." }
        };
        
        let currentAction = action;
        if(action === 'ban' && !org.isEnabled) currentAction = 'unban';
        const fullConfig = {
            ...actionConfig,
            unban: { title: "Confirmare Deblocare", message: `Ești sigur că vrei să deblochezi contul pentru ${org.firstName}?`, api: () => api.post(`/admin/organizers/${userId}/ban`), success: "Status actualizat!" }
        };

        if (fullConfig[currentAction]) {
             setDialog({
                isOpen: true,
                title: fullConfig[currentAction].title,
                message: fullConfig[currentAction].message,
                onConfirm: async () => {
                    setDialog({ isOpen: false });
                    setProcessingId(userId);
                    try {
                        await fullConfig[currentAction].api();
                        toast.success(fullConfig[currentAction].success);
                        fetchData();
                    } catch (error) {
                        toast.error("Acțiunea a eșuat.");
                    } finally {
                        setProcessingId(null);
                    }
                },
                onCancel: () => setDialog({isOpen: false})
            });
        }
    };
    
    const confirmSuspend = async () => {
        setProcessingId(selectedUserId);
        try {
            await api.post(`/admin/organizers/${selectedUserId}/suspend`, null, { params: { days: suspendDays } });
            toast.success(`Suspendat pentru ${suspendDays} zile.`);
            setSuspendModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Eroare la suspendare.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 relative">
            
            <ConfirmDialog 
                isOpen={dialog.isOpen}
                onConfirm={dialog.onConfirm}
                onCancel={() => setDialog({ isOpen: false })}
                title={dialog.title}
                message={dialog.message}
            />

            {/* Preview Modal */}
            {previewEvent && (
                <PreviewModal event={previewEvent} onClose={() => setPreviewEvent(null)} />
            )}

            {/* Rejection Modals */}
            <AnimatePresence>
                {eventRejectModalOpen && (
                     <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-card rounded-[2rem] shadow-2xl w-full max-w-md p-8 border border-white/20 dark:border-gray-800">
                            <h3 className="text-xl font-bold text-red-600 dark:text-red-500 mb-2 flex items-center gap-3 uppercase"><AlertCircle className="w-6 h-6" /> Respinge Eveniment</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-medium">Te rugăm să specifici de ce este respins acest eveniment.</p>
                            <textarea className="w-full bg-white dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 min-h-[120px] outline-none focus:ring-4 focus:ring-red-50 dark:focus:ring-red-900/20 focus:border-red-200 dark:focus:border-red-900/30 transition-all font-medium text-gray-700 dark:text-gray-300 text-sm" placeholder="Motivul respingerii..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                            <div className="flex justify-end gap-3 mt-8">
                                <button onClick={() => setEventRejectModalOpen(false)} className="px-6 py-3 text-gray-400 dark:text-gray-500 font-semibold text-xs uppercase hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Anulează</button>
                                <button onClick={confirmRejectEvent} className="px-8 py-3.5 bg-red-600 text-white rounded-xl font-semibold text-xs uppercase shadow-xl shadow-red-200 dark:shadow-red-900/20 hover:bg-red-700 active:scale-95 transition-all">Respinge</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {rejectModalOpen && (
                     <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-card rounded-[2rem] shadow-2xl w-full max-w-md p-8 border border-white/20 dark:border-gray-800">
                            <h3 className="text-xl font-bold text-red-600 dark:text-red-500 mb-2 flex items-center gap-3 uppercase"><AlertCircle className="w-6 h-6" /> Respinge Cerere</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-medium">De ce respingi această solicitare?</p>
                            <textarea className="w-full bg-white dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 min-h-[120px] outline-none focus:ring-4 focus:ring-red-50 dark:focus:ring-red-900/20 focus:border-red-200 dark:focus:border-red-900/30 transition-all font-medium text-gray-700 dark:text-gray-300 text-sm" placeholder="Motiv..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                            <div className="flex justify-end gap-3 mt-8">
                                <button onClick={() => setRejectModalOpen(false)} className="px-6 py-3 text-gray-400 dark:text-gray-500 font-semibold text-xs uppercase hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Anulează</button>
                                <button onClick={confirmRejectRequest} className="px-8 py-3.5 bg-red-600 text-white rounded-xl font-semibold text-xs uppercase shadow-xl shadow-red-200 dark:shadow-red-900/20 hover:bg-red-700 active:scale-95 transition-all">Respinge</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {suspendModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-card rounded-[2rem] shadow-2xl w-full max-w-md p-8 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-xl font-bold text-orange-600 dark:text-orange-500 mb-4 uppercase"><Timer className="inline w-6 h-6 mr-2" /> Suspendă Cont</h3>
                            <div className="flex items-center gap-3 mb-8">
                                {[3, 7, 14, 30].map(d => (
                                    <button key={d} onClick={() => setSuspendDays(d)} className={`flex-1 py-3 rounded-xl font-bold border transition-all text-sm ${suspendDays === d ? 'bg-orange-500 text-white border-orange-500 shadow-lg' : 'bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{d}z</button>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setSuspendModalOpen(false)} className="px-6 py-3 font-semibold text-gray-400 dark:text-gray-500 text-xs uppercase hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Anulează</button>
                                <button onClick={confirmSuspend} className="px-8 py-3.5 bg-orange-600 text-white rounded-xl font-semibold text-xs uppercase shadow-xl shadow-orange-200 dark:shadow-orange-900/20 hover:bg-orange-700 active:scale-95 transition-all">Confirmă</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="bg-background/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col items-center justify-center gap-6">
                        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">Admin Panel</h1>
                        <div className="flex bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-[2rem] w-full md:w-auto overflow-x-auto no-scrollbar border border-gray-100 dark:border-gray-800">
                            {[
                                { id: 'events', label: 'Aprobări', icon: Calendar },
                                { id: 'requests', label: 'Cereri', icon: Briefcase },
                                { id: 'manage', label: 'Moderare', icon: Shield },
                                { id: 'all-events', label: 'Evenimente', icon: Layers },
                                { id: 'reviews', label: 'Recenzii', icon: MessageSquare },
                                { id: 'users', label: 'Utilizatori', icon: Users },
                                { id: 'reports', label: 'Statistici', icon: BarChart3 }
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-xs flex-1 md:flex-none justify-center whitespace-nowrap transition-all duration-300 ${activeTab === tab.id ? 'bg-white dark:bg-gray-800 shadow-md ring-1 ring-black/5 dark:ring-white/5' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'}`}>
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : ''}`} />
                                    <span className={activeTab === tab.id ? 'bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent' : ''}>
                                        {tab.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {loading ? <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></div> : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'events' && (
                             <motion.div key="events-tab" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="space-y-6">
                                <div className="bg-card p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Evenimente în așteptarea aprobării</h2>
                                    <div className="grid grid-cols-1 gap-6">
                                        {events.length === 0 ? <p className="text-center text-gray-400 dark:text-gray-500 py-10 font-medium">Niciun eveniment în așteptare.</p> :
                                        events.map(evt => (
                                            <div key={evt.id} className="bg-card dark:bg-card/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition-shadow">
                                                <div className="w-full md:w-48 h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shrink-0 relative group cursor-pointer" onClick={() => setPreviewEvent(evt)}>
                                                    <img src={evt.imageUrl || PLACEHOLDER_IMAGE} alt={evt.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Eye className="text-white w-8 h-8 drop-shadow-lg" />
                                                    </div>
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{evt.title}</h3>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> {new Date(evt.date).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {evt.location}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-3 leading-relaxed">{evt.description}</p>
                                                </div>
                                                <div className="flex gap-3 w-full md:w-auto shrink-0 flex-wrap md:flex-nowrap">
                                                    <button onClick={() => setPreviewEvent(evt)} disabled={processingId === evt.id} className="flex-1 bg-black dark:bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-gray-800 dark:hover:bg-black transition-all active:scale-95">Detalii</button>
                                                    <button onClick={() => handleEventAction(evt.id, 'approve')} disabled={processingId === evt.id} className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-green-200 dark:shadow-green-900/20 hover:bg-green-700 transition-all active:scale-95">Aprobă</button>
                                                    <button onClick={() => handleEventAction(evt.id, 'reject')} disabled={processingId === evt.id} className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-200 dark:shadow-red-900/20">Respinge</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'requests' && (
                            <motion.div key="requests-tab" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="space-y-6">
                                <div className="bg-card p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Cereri de organizator</h2>
                                    <div className="grid grid-cols-1 gap-6">
                                        {organizerRequests.length === 0 ? (
                                            <p className="text-center text-gray-400 dark:text-gray-500 py-10 font-medium">Nicio cerere nouă.</p>
                                        ) : (
                                            organizerRequests.map(req => (
                                                <div key={req.id} className="bg-card dark:bg-card/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-6 items-start justify-between hover:shadow-md transition-shadow">
                                                    <div className="flex gap-5 items-start flex-grow min-w-0">
                                                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-orange-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-orange-500/20 shrink-0">
                                                            {req.firstName[0].toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0 flex-grow">
                                                            <div className="mb-3">
                                                                <p className="font-bold text-gray-900 dark:text-white text-lg">{req.firstName} {req.lastName}</p>
                                                                <p className="text-xs font-bold text-primary dark:text-primary-foreground uppercase tracking-widest bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-md inline-block mt-1">{req.pendingOrganizationName}</p>
                                                            </div>
                                                            
                                                            {req.pendingReason && (
                                                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 relative">
                                                                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-white dark:bg-card rounded-full border border-gray-100 dark:border-gray-800 flex items-center justify-center shadow-sm">
                                                                        <MessageSquare className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Motiv solicitare:</p>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed italic">"{req.pendingReason}"</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                                                        <button onClick={() => handleRequestAction(req.id, 'approve')} disabled={processingId === req.id} className="flex-1 md:flex-none bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95">Aprobă</button>
                                                        <button onClick={() => handleRequestAction(req.id, 'reject')} disabled={processingId === req.id} className="flex-1 md:flex-none bg-white dark:bg-gray-900 text-red-500 border border-red-200 dark:border-red-900/50 px-6 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Respinge</button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'manage' && (
                             <motion.div key="manage-tab" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="bg-card rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
                                <div className="px-8 py-4 border-b border-gray-50 dark:border-gray-800 bg-card flex justify-between items-center flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Moderare Organizatori</h3>
                                    </div>
                                    <button 
                                        onClick={exportOrganizers}
                                        className=" flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-gray-800 text-white rounded-xl font-semibold text-[10px] uppercase tracking-widest hover:bg-black dark:hover:bg-gray-700 transition-all shadow-lg active:scale-95"
                                    >
                                        <Download className="w-3.5 h-3.5"  /> Export
                                    </button>
                                </div>
                                <div className="overflow-x-auto ">
                                    <table className="w-full text-left ">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-gray-900/30">
                                                <th className="px-8 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Organizator</th>
                                                <th className="px-8 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase text-center">Status</th>
                                                <th className="px-8 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase text-center">Evenimente/Rating</th>
                                                <th className="px-8 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase text-center">Ultima Activitate</th>
                                                <th className="px-8 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase text-right">Acțiuni</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                            {organizersStats.map(org => (
                                                <tr key={org.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <div className="flex flex-col justify-center pt-1">
                                                            <span className="font-bold text-gray-900 dark:text-white text-[15px]">{org.firstName} {org.lastName}</span>
                                                            <span className="text-xs text-primary dark:text-primary-foreground font-bold uppercase tracking-tight">{org.organizationName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex justify-center">
                                                            {!org.isEnabled ? (
                                                                <span className="px-4 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold rounded-full text-[11px] uppercase tracking-wider shadow-sm">Banned</span>
                                                            ) : org.suspendedUntil && new Date(org.suspendedUntil) > new Date() ? (
                                                                <span className="px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-bold rounded-full text-[11px] uppercase tracking-wider shadow-sm">Suspended</span>
                                                            ) : (
                                                                <span className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold rounded-full text-[11px] uppercase tracking-wider shadow-sm">Active</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        <div className="flex items-center justify-center gap-5">
                                                            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                                                                <Layers className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                                <span className="text-[14px]">{org.eventCount}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-amber-500">
                                                                <Star className="w-4 h-4 fill-current" />
                                                                <span className="text-[14px] font-black">{org.averageRating ? org.averageRating.toFixed(1) : 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                                        {org.lastEventDate ? new Date(org.lastEventDate).toLocaleDateString('ro-RO') : 'N/A'}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); openSuspendModal(org); }}
                                                                className={`p-2 rounded-lg transition-colors border border-transparent ${ 
                                                                    org.suspendedUntil && new Date(org.suspendedUntil) > new Date() 
                                                                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30' 
                                                                        : 'hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400' 
                                                                }`}
                                                                title="Suspendare"
                                                            >
                                                                {org.suspendedUntil && new Date(org.suspendedUntil) > new Date() ? <Check className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
                                                            </button>
                                                            <button onClick={() => handleModeration(org.id, 'downgrade')} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30" title="Retrogradează">
                                                                <UserMinus className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleModeration(org.id, 'ban')} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30" title={!org.isEnabled ? "Deblochează" : "Bannează"}>
                                                                <Ban className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'all-events' && (
                            <motion.div key="all-events-tab" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="space-y-6">
                                <div className="bg-card p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Evenimente</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {allEvents.length === 0 ? (
                                            <p className="text-center text-gray-400 dark:text-gray-500 py-10 font-medium col-span-full">Niciun eveniment publicat.</p>
                                        ) : (
                                            allEvents.map(evt => (
                                                <div key={evt.id} className="bg-card dark:bg-card/50 p-4 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition-shadow group">
                                                    <div className="w-full md:w-40 h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shrink-0">
                                                        <img src={evt.imageUrl || PLACEHOLDER_IMAGE} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${ 
                                                                evt.status === 'PUBLISHED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 
                                                                evt.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                            }`}>{evt.status}</span>
                                                            <span className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">{evt.category}</span>
                                                        </div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white truncate text-lg mt-1">{evt.title}</h3>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> {evt.location} • <Calendar className="w-3 h-3"/> {new Date(evt.startTime).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex gap-2 w-full md:w-auto shrink-0">
                                                        <button 
                                                            onClick={() => setPreviewEvent(evt)}
                                                            className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                            title="Vezi Detalii"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteEvent(evt.id)}
                                                            className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                                            title="Șterge Eveniment"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'reviews' && (
                            <motion.div key="reviews-tab" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="space-y-6">
                                <div className="bg-card p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Recenzii Evenimente</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {allReviews.length === 0 ? (
                                            <p className="col-span-full text-center text-gray-400 dark:text-gray-500 py-10 font-medium">Nicio recenzie pe platformă.</p>
                                        ) : (
                                            allReviews.map(rev => (
                                                <div key={rev.id} className="bg-card dark:bg-card/50 p-7 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-primary font-bold shadow-inner border border-gray-200 dark:border-gray-700 shrink-0">
                                                                {rev.user?.firstName?.[0] || 'U'}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-gray-900 dark:text-white leading-tight truncate">{rev.user?.firstName} {rev.user?.lastName}</p>
                                                                <div className="flex items-center gap-1 text-amber-400 mt-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-200 dark:text-gray-700'}`} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleDeleteReview(rev.id)}
                                                            className="p-2.5 text-gray-300 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-90"
                                                            title="Șterge Recenzie"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>

                                                    <div className="flex-grow">
                                                        <div className="relative">
                                                            <div className="absolute -left-3 top-0 bottom-0 w-1 bg-primary/10 rounded-full"></div>
                                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic font-normal pl-4">"{rev.comment}"</p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-8 pt-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Layers className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest truncate max-w-[150px]">{rev.event?.title}</span>
                                                        </div>
                                                        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">{new Date(rev.createdAt).toLocaleDateString('ro-RO')}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'users' && (
                            <motion.div key="users-tab" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="bg-card rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
                                <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-card flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">LISTĂ UTILIZATORI & ORGANIZATORI</h3>
                                    </div>
                                    <button 
                                        onClick={exportUsers}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-gray-800 text-white rounded-xl font-semibold text-[10px] uppercase tracking-widest hover:bg-black dark:hover:bg-gray-700 transition-all active:scale-95 shadow-lg"
                                    >
                                        <Download className="w-3 h-3" /> Export
                                    </button>
                                </div>
                                <div className="overflow-x-auto pr-5 pl-5">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-gray-900/30">
                                                <th className="px-4 py-3 text-[14px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Utilizator</th>
                                                <th className="px-4 py-3 text-[14px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rol</th>
                                                <th className="px-4 py-3 text-[14px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                                <th className="px-4 py-3 text-[14px] font-bold text-gray-500 dark:text-gray-400 uppercase text-center tracking-wider">Status</th>
                                                <th className="px-4 py-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase text-center tracking-wider">Data Înscrierii</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                            {allUsers.map((u) => (
                                                <tr key={u.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{u.firstName} {u.lastName}</span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                                        <div className="flex justify-start">
                                                            <span className={`inline-flex items-center justify-center min-w-[100px] px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-tight shadow-sm whitespace-nowrap ${ 
                                                                u.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                                                                u.role === 'ORGANIZER' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 
                                                                'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                                            }`}>
                                                                {u.role}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        {u.email}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex justify-center">
                                                            {u.isEnabled !== false ? (
                                                                <span className="inline-flex items-center px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold rounded-full text-[11px] uppercase tracking-wider">
                                                                    Activ
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold rounded-full text-[11px] uppercase tracking-wider">
                                                                    Blocat
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'reports' && reports && (
                            <motion.div key="reports-tab" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className="space-y-8">
                                {/* Header Rapoarte */}
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Performanță Sistem</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Statistici live</p>
                                    </div>
                                    <button 
                                        onClick={exportFullReport}
                                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-800 text-white rounded-2xl font-semibold text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-gray-700 transition-all active:scale-95 shadow-xl"
                                    >
                                        <Download className="w-4 h-4" /> Raport CSV
                                    </button>
                                </div>

                                {/* Cards Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[ 
                                        { label: 'Bilete Vândute', value: reports.totalTicketsSold ?? reports.soldTickets ?? reports.totalTickets ?? reports.totalBookings ?? reports.bookings ?? reports.totalReservations ?? 0, icon: Ticket, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-900/30' },
                                        { label: 'Bilete Validate', value: reports.totalCheckIns ?? reports.validatedTickets ?? reports.checkedInTickets ?? reports.checkIns ?? 0, icon: CheckCircle2, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/20', border: 'border-purple-100 dark:border-purple-900/30' },
                                        { label: 'Rată Prezență', value: `${(reports.averageParticipation?? 0).toFixed(1)}%`, icon: Activity, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/20', border: 'border-orange-100 dark:border-orange-900/30' },
                                        { label: 'Evenimente Noi', value: reports.newEvents ?? reports.pendingEvents ?? 0, icon: PlusCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/20', border: 'border-rose-100 dark:border-rose-900/30' }
                                    ].map((stat, i) => (
                                        <div key={i} className={`bg-card p-8 rounded-[2.5rem] border ${stat.border} shadow-sm hover:shadow-xl transition-all group`}><div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}><stat.icon className="w-7 h-7" /></div><p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{stat.label}</p><p className="text-4xl font-bold text-gray-900 dark:text-white leading-none tracking-tight">{stat.value}</p></div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Top Organizatori */}
                                    <div className="bg-card p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-full"><h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-3"><Shield className="w-5 h-5 text-yellow-500" /> Top Organizatori</h4><div className="space-y-6 flex-grow">{[...organizersStats].sort((a, b) => b.eventCount - a.eventCount).slice(0, 3).map((org, i) => (<div key={org.id} className="flex items-center justify-between group p-3 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-2xl transition-colors"><div className="flex items-center gap-4"><div className={`w-10 h-10 ${i === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg' : 'bg-gray-200 dark:bg-gray-800'} text-white rounded-xl flex items-center justify-center font-bold shadow-sm text-sm shrink-0`}>{i + 1}</div><div className="min-w-0"><p className="font-bold text-gray-900 dark:text-white leading-tight truncate">{org.firstName} {org.lastName}</p><p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wide truncate">{org.organizationName}</p></div></div><div className="text-right pl-4"><p className="font-bold text-gray-900 dark:text-white text-lg">{org.eventCount}</p><p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tighter">Event-uri</p></div></div>))}</div></div>

                                    {/* Categorii Breakdown */}
                                    <div className="bg-card p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-full"><h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-3"><PieChart className="w-5 h-5 text-blue-500" /> Categorii</h4><div className="space-y-5 flex-grow overflow-y-auto custom-scrollbar pr-2 max-h-[300px]">{Object.entries(reports.eventsByCategory).map(([cat, count]) => { const percentage = ((count / reports.totalEvents) * 100).toFixed(0); return (<div key={cat} className="space-y-2"><div className="flex justify-between text-xs font-bold"><span className="text-gray-600 dark:text-gray-400 uppercase">{cat}</span><span className="text-blue-600 dark:text-blue-400">{count} ({percentage}%)</span></div><div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className="h-full bg-blue-500 dark:bg-blue-600 rounded-full" /></div></div>); })}</div></div>

                                    {/* Monthly Activity */}
                                    <div className="bg-card p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-full"><h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-3"><TrendingUp className="w-5 h-5 text-emerald-500" /> Activitate Lunară</h4><div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-2 max-h-[300px]">{Object.entries(reports.eventsByMonth).length === 0 ? (<p className="text-center text-gray-400 dark:text-gray-500 py-10 font-medium">Fără date.</p>) : (Object.entries(reports.eventsByMonth).map(([month, count]) => (<div key={month} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors rounded-2xl border border-gray-100/50 dark:border-gray-800/50"><div className="flex items-center gap-3"><div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse" /><span className="font-bold text-gray-700 dark:text-gray-300 text-sm">{month}</span></div><span className="bg-card px-3 py-1 rounded-lg text-xs font-bold text-gray-900 dark:text-white shadow-sm">{count}</span></div>)))}</div></div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
