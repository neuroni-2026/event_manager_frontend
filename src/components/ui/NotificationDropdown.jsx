import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Info, AlertCircle, CheckCircle2, Clock, X, Calendar, Trash2, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

const NotificationDropdown = ({ onClose, onUpdateUnreadCount }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setNotifications(sorted);
            updateUnreadCount(sorted);
        } catch (error) {
            console.error("Could not load notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateUnreadCount = (list) => {
        if (onUpdateUnreadCount) {
            const count = list.filter(n => !n.isRead).length;
            onUpdateUnreadCount(count);
        }
    };

    const markAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await api.put(`/notifications/${id}/read`);
            const updated = notifications.map(n => 
                n.id === id ? { ...n, isRead: true } : n
            );
            setNotifications(updated);
            updateUnreadCount(updated);
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unread = notifications.filter(n => !n.isRead);
            if (unread.length === 0) return;

            // In a real scenario, use a bulk endpoint if available
            await Promise.all(unread.map(n => api.put(`/notifications/${n.id}/read`)));
            
            const updated = notifications.map(n => ({ ...n, isRead: true }));
            setNotifications(updated);
            updateUnreadCount(updated);
        } catch (error) {
            console.error("Error marking all as read");
        }
    };

    const getIconStyles = (type) => {
        switch (type) {
            case 'ALERT': 
            case 'EVENT_REJECTED':
                return { 
                    bg: 'bg-red-50', 
                    text: 'text-red-500', 
                    icon: <AlertCircle className="w-5 h-5" /> 
                };
            case 'SUCCESS': 
            case 'EVENT_APPROVED':
                return { 
                    bg: 'bg-emerald-50', 
                    text: 'text-emerald-600', 
                    icon: <CheckCircle2 className="w-5 h-5" /> 
                };
            case 'REMINDER':
                return {
                    bg: 'bg-orange-50',
                    text: 'text-orange-500',
                    icon: <Clock className="w-5 h-5" />
                };
            default: 
                return { 
                    bg: 'bg-primary/10', 
                    text: 'text-primary', 
                    icon: <Info className="w-5 h-5" /> 
                };
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-[4.5rem] right-0 w-[26rem] max-h-[85vh] bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-white/20 ring-1 ring-black/5 z-50 overflow-hidden flex flex-col font-sans"
        >
            {/* Header */}
            <div className="px-6 py-4 pb-0 border-b border-gray-100/50 flex justify-between items-center bg-white/50 sticky top-0 z-10">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">Notificări</h3>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                        Ai {notifications.filter(n => !n.isRead).length} mesaje necitite
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    {notifications.some(n => !n.isRead) && (
                        <button 
                            onClick={markAllAsRead}
                            className="p-2 text-primary hover:bg-primary/10 rounded-full transition-all text-xs font-semibold flex items-center gap-1"
                            title="Marchează tot ca citit"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Tot</span>
                        </button>
                    )}
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-100/80 rounded-full transition-all text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-grow scrollbar-hide custom-scrollbar">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-400 font-medium">Se încarcă...</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-24 px-8 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <Bell className="w-8 h-8" />
                        </div>
                        <h4 className="text-gray-900 font-semibold mb-1">Ești la zi!</h4>
                        <p className="text-sm text-gray-500 max-w-[200px] leading-relaxed">
                            Nu ai nicio notificare nouă momentan.
                        </p>
                    </div>
                ) : (
                    <div className="py-2">
                        {notifications.map((notif) => {
                            const style = getIconStyles(notif.type);
                            return (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={notif.id} 
                                    className={`
                                        mx-3 my-1 p-4 rounded-2xl transition-all duration-200 cursor-default group relative
                                        ${!notif.isRead 
                                            ? 'bg-gradient-to-r from-orange-50/50 to-transparent hover:from-orange-50' 
                                            : 'hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <div className="flex gap-4">
                                        {/* Icon Box */}
                                        <div className={`
                                            flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                                            ${style.bg} ${style.text} shadow-sm ring-1 ring-black/5
                                        `}>
                                            {style.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-grow min-w-0 pt-0.5 pr-8">
                                            <p className={`text-sm leading-relaxed ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                {notif.message}
                                            </p>
                                            
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ro })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Unread Action */}
                                        {!notif.isRead && (
                                            <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col items-center gap-1">
                                                 <button 
                                                    onClick={(e) => markAsRead(notif.id, e)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-green-600 hover:border-green-200 hover:bg-green-50 shadow-sm transition-all"
                                                    title="Marchează ca citit"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1"></div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
                <button 
                    onClick={() => { onClose(); navigate('/notifications'); }}
                    className="w-full py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 group"
                >
                    <span>Vezi tot istoricul</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
};

export default NotificationDropdown;