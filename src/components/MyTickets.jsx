import { useEffect, useState } from 'react';
import api from '../services/api';
import QRCode from 'react-qr-code';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Ticket as TicketIcon, Calendar, MapPin, User, ArrowRight, Loader2, Plane, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TicketView from './TicketView';

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await api.get('/tickets/my-tickets'); 
                setTickets(response.data);
            } catch (error) {
                console.error("Error loading tickets:", error);
                if (error.response && error.response.status === 403) {
                    toast.error("Acces interzis. Doar studenții au acces.");
                    navigate('/');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [navigate]);

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center bg-[#f9fafb]">
             <div className="flex flex-col items-center gap-3">
                <div className="relative">
                    <div className="w-12 h-12 bg-primary/10 rounded-full animate-ping absolute inset-0"></div>
                    <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                </div>
                <p className="text-gray-500 font-medium text-lg">Se încarcă portofelul...</p>
             </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f9fafb] pb-20 pt-12 font-['Inter',_sans-serif]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
                            <div className="bg-gradient-to-br from-primary to-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-200 text-white">
                                <TicketIcon className="w-6 h-6" />
                            </div>
                            Portofel Bilete
                        </h2>
                        <p className="text-gray-500 mt-2 text-lg font-medium">Gestionează biletele tale digitale pentru evenimente.</p>
                    </div>
                    {tickets.length > 0 && (
                        <div className="bg-white px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm text-sm font-bold text-gray-600">
                            Total: <span className="text-primary text-base ml-1">{tickets.length}</span> Bilete
                        </div>
                    )}
                </div>
                
                {tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
                        <div className="bg-orange-50 p-6 rounded-full mb-6">
                            <TicketIcon className="w-12 h-12 text-primary/40" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Nu ai bilete încă</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed font-medium">
                            Nu ai achiziționat niciun bilet. Explorează evenimentele disponibile și rezervă-ți locul acum!
                        </p>
                        <button 
                            className="bg-gradient-to-r from-primary to-orange-600 hover:to-primary text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-2"
                            onClick={() => navigate('/events')}
                        >
                            Explorează Evenimente
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {tickets.map((ticket, index) => (
                            <motion.div
                                key={ticket.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div 
                                    onClick={() => setSelectedTicket(ticket)}
                                    className="cursor-pointer group flex flex-col sm:flex-row bg-white rounded-[2rem] shadow-md hover:shadow-2xl hover:shadow-primary/10 border border-gray-100 overflow-hidden transition-all duration-300 h-full transform hover:-translate-y-1"
                                >
                                    {/* LEFT SIDE: Event Info */}
                                    <div className="flex-grow p-7 sm:p-8 relative bg-white">
                                        
                                        {/* Status Badge */}
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider border border-emerald-100">
                                                Valid
                                            </span>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID Bilet</p>
                                                <p className="font-mono text-gray-600 font-bold">#{ticket.qrCode?.substring(0, 8)}</p>
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-black text-gray-900 mb-6 leading-tight group-hover:text-primary transition-colors no-underline">
                                            {ticket.eventTitle}
                                        </h3>
                                        
                                        <div className="grid grid-cols-2 gap-y-5 gap-x-2">
                                            <div>
                                                <p className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">
                                                    <Calendar className="w-3 h-3" /> Data
                                                </p>
                                                <p className="text-gray-900 font-bold text-sm">
                                                    {new Date(ticket.eventDate).toLocaleDateString('ro-RO', { 
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-xs text-gray-500 font-medium mt-0.5">
                                                    {new Date(ticket.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">
                                                    <MapPin className="w-3 h-3" /> Locație
                                                </p>
                                                <p className="text-gray-900 font-bold text-sm line-clamp-2" title={ticket.eventLocation}>
                                                    {ticket.eventLocation}
                                                </p>
                                            </div>
                                            <div className="col-span-2 pt-5 border-t border-gray-100 mt-2 flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-inner ring-2 ring-white">
                                                    {ticket.studentName?.[0]?.toUpperCase()}
                                                </div>
                                                <span className="text-sm text-gray-700 font-bold">{ticket.studentName}</span>
                                            </div>
                                        </div>

                                        {/* Punch Holes Right (Desktop only) */}
                                        <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#f9fafb] rounded-full border border-gray-200 z-10 box-content"></div>
                                    </div>

                                    {/* RIGHT SIDE: QR Stub */}
                                    <div className="relative w-full sm:w-48 bg-[#1a1a1a] text-white p-6 flex flex-col items-center justify-center sm:border-l-2 sm:border-dashed sm:border-gray-800">
                                        {/* Punch Holes Left (Desktop only) */}
                                        <div className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#f9fafb] rounded-full z-10"></div>
                                        
                                        <div className="bg-white p-2.5 rounded-xl shadow-lg mb-4 transform group-hover:scale-105 transition-transform duration-300">
                                            <QRCode 
                                                value={ticket.qrCode || "no-code"} 
                                                size={100} 
                                                className="w-full h-auto"
                                            />
                                        </div>
                                        
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Scan Me</span>
                                        <div className="flex items-center gap-1.5 text-xs text-primary font-bold group-hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-lg">
                                            Detalii <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            
            <AnimatePresence>
                {selectedTicket && (
                    <TicketView 
                        ticket={selectedTicket} 
                        onClose={() => setSelectedTicket(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyTickets;