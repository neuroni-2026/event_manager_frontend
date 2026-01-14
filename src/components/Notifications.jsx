import { useEffect, useState } from 'react';
import api from '../services/api';
import { 
    Bell, Check, Info, AlertCircle, CheckCircle2, Clock, Filter, CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Button } from './ui/button';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); 

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/notifications');
            const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setNotifications(sorted);
        } catch (error) {
            console.error("Could not load notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => 
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const markAllAsRead = async () => {
        const unread = notifications.filter(n => !n.isRead);
        if (unread.length === 0) return;

        try {
            await Promise.all(unread.map(n => api.put(`/notifications/${n.id}/read`)));
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const getIconStyles = (type) => {
        switch (type) {
            case 'ALERT': 
            case 'EVENT_REJECTED':
                return { 
                    bg: 'bg-red-50 text-red-500', 
                    icon: <AlertCircle className="w-6 h-6" /> 
                };
            case 'SUCCESS': 
            case 'EVENT_APPROVED':
                return { 
                    bg: 'bg-emerald-50 text-emerald-600', 
                    icon: <CheckCircle2 className="w-6 h-6" /> 
                };
            case 'REMINDER':
                return {
                    bg: 'bg-orange-50 text-orange-500',
                    icon: <Clock className="w-6 h-6" />
                };
            default: 
                return { 
                    bg: 'bg-primary/10 text-primary', 
                    icon: <Info className="w-6 h-6" /> 
                };
        }
    };

    const filteredNotifications = filter === 'unread' 
        ? notifications.filter(n => !n.isRead) 
        : notifications;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-12 font-['Inter',_sans-serif]">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Notificări</h1>
                        <p className="text-gray-500 mt-2 font-medium">
                            Gestionează alertele și actualizările contului tău.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={markAllAsRead}
                                className="bg-white hover:bg-orange-50 hover:text-primary hover:border-orange-200 transition-all gap-2 border-gray-200 text-gray-600 font-semibold"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Marchează tot ca citit
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters & Stats */}
                <div className="bg-white rounded-2xl p-2 mb-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex gap-1">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                filter === 'all' 
                                    ? 'bg-gradient-to-r from-primary to-orange-600 text-white shadow-md shadow-primary/20 scale-105' 
                                    : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            Toate
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                                filter === 'unread' 
                                    ? 'bg-gradient-to-r from-primary to-orange-600 text-white shadow-md shadow-primary/20 scale-105' 
                                    : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            Necitite
                            {unreadCount > 0 && (
                                <span className={`px-2 py-0.5 rounded-md text-[11px] ${
                                    filter === 'unread' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                                }`}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="pr-4 hidden sm:flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                        <Filter className="w-3 h-3" />
                        Filtrează
                    </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="w-14 h-14 bg-gray-100 rounded-2xl"></div>
                                    <div className="flex-grow space-y-3 py-1">
                                        <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-24 bg-white rounded-[2rem] border border-gray-100 shadow-sm"
                    >
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell className="w-10 h-10 text-primary/40" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Nicio notificare</h3>
                        <p className="text-gray-500 mt-2 max-w-xs mx-auto font-medium">
                            {filter === 'unread' 
                                ? 'Ai citit toate mesajele! Te vom anunța când apare ceva nou.' 
                                : 'Nu ai nicio notificare în istoric momentan.'}
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence mode='popLayout'>
                            {filteredNotifications.map((notif) => {
                                const styles = getIconStyles(notif.type);
                                return (
                                    <motion.div 
                                        key={notif.id} 
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                        className={`group relative p-6 rounded-[1.5rem] border transition-all duration-300 ${
                                            !notif.isRead 
                                                ? 'bg-white border-orange-100 shadow-[0_8px_30px_-6px_rgba(255,107,107,0.15)] ring-1 ring-primary/5' 
                                                : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm opacity-90'
                                        }`}
                                    >
                                        <div className="flex gap-6">
                                            {/* Icon */}
                                            <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-black/5 ${styles.bg}`}>
                                                {styles.icon}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-grow min-w-0 py-0.5">
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <span className={`text-[11px] font-bold uppercase tracking-widest ${!notif.isRead ? 'text-primary' : 'text-gray-400'}`}>
                                                        {notif.type?.replace('_', ' ') || 'Sistem'}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ro })}
                                                    </span>
                                                </div>
                                                
                                                <p className={`text-[16px] leading-relaxed mb-4 ${!notif.isRead ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}>
                                                    {notif.message}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    {!notif.isRead ? (
                                                        <button 
                                                            onClick={() => markAsRead(notif.id)}
                                                            className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            Marchează ca citit
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                            <CheckCheck className="w-3.5 h-3.5" />
                                                            Citit
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Unread Indicator */}
                                            {!notif.isRead && (
                                                <div className="absolute top-6 right-6">
                                                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(255,107,107,0.6)]"></div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;