import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import QRCode from 'react-qr-code';
import { Loader2, ArrowLeft, Printer, CheckCircle, MapPin, Calendar, Clock, User, Ticket, Download } from 'lucide-react';

const TicketView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const response = await api.get(`/tickets/${id}`);
                setTicket(response.data);
            } catch (err) {
                console.error(err);
                if (err.response && err.response.status === 403) {
                    setError("⛔ Acces interzis! Nu deții acest bilet.");
                } else {
                    setError("Nu s-au putut încărca detaliile biletului.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center bg-[#f9fafb]">
             <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-gray-500 font-medium">Se generează biletul...</p>
             </div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-[60vh] px-4 text-center bg-[#f9fafb]">
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md border border-red-100 shadow-sm">
                <h3 className="text-lg font-bold mb-2">Eroare</h3>
                <p className="mb-6">{error}</p>
                <button 
                    onClick={() => navigate('/my-tickets')}
                    className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                    Înapoi la portofel
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f9fafb] py-12 px-4 flex flex-col items-center justify-center font-['Inter',_sans-serif]">
            
            {/* Action Bar */}
            <div className="w-full max-w-md flex justify-start mb-6 print:hidden">
                <button 
                    onClick={() => navigate('/my-tickets')}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-bold text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Înapoi
                </button>
            </div>

            {/* Ticket Card */}
            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none border border-gray-100">
                
                {/* Header Section */}
                <div className="bg-gradient-to-br from-primary to-orange-600 p-8 text-white text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-md mb-5 border border-white/20">
                            <CheckCircle className="w-4 h-4 text-white" />
                            <span className="text-[11px] font-bold uppercase tracking-widest">Bilet Valid</span>
                        </div>
                        <h1 className="text-2xl font-black leading-tight mb-2 tracking-tight">{ticket.eventTitle}</h1>
                        <p className="text-white/90 text-sm font-medium opacity-90">ID: #{ticket.qrCode.substring(0, 8)}</p>
                    </div>
                    
                    {/* Abstract Pattern Overlay */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                </div>

                {/* QR Section */}
                <div className="bg-white p-8 pb-4 flex flex-col items-center justify-center relative">
                    <div className="p-4 bg-white border-4 border-gray-900 rounded-2xl shadow-sm mb-4">
                        <QRCode 
                            value={ticket.qrCode} 
                            size={180}
                            level="H"
                            className="w-full h-auto"
                        />
                    </div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">Scanează la intrare</p>
                    
                    {/* Dotted Line */}
                    <div className="w-full border-t-2 border-dashed border-gray-200"></div>
                </div>

                {/* Details Section */}
                <div className="p-8 pt-4 space-y-6 bg-white">
                    
                    {/* 1. Date & Time */}
                    <div className="flex items-start gap-4">
                        <div className="bg-orange-50 p-3 rounded-2xl text-primary shrink-0">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Data și Ora</p>
                            <p className="font-bold text-gray-900 text-lg leading-tight">
                                {new Date(ticket.eventDate).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <p className="text-sm font-semibold text-gray-600">
                                {new Date(ticket.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>

                    {/* 2. Location */}
                    <div className="flex items-start gap-4">
                        <div className="bg-orange-50 p-3 rounded-2xl text-primary shrink-0">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Locație</p>
                            <p className="font-bold text-gray-900 text-lg leading-tight">
                                {ticket.eventLocation}
                            </p>
                        </div>
                    </div>

                    {/* 3. Participant */}
                    <div className="flex items-start gap-4">
                        <div className="bg-orange-50 p-3 rounded-2xl text-primary shrink-0">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Participant</p>
                            <p className="font-bold text-gray-900 text-lg">{ticket.studentName}</p>
                        </div>
                    </div>

                    {/* 4. Ticket ID */}
                    <div className="flex items-start gap-4">
                        <div className="bg-orange-50 p-3 rounded-2xl text-primary shrink-0">
                            <Ticket className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">ID Bilet</p>
                            <p className="font-bold text-gray-900 text-sm font-mono tracking-wider">
                                {ticket.qrCode}
                            </p>
                        </div>
                    </div>

                    {/* 5. Purchase Date */}
                    <div className="flex items-start gap-4 border-t border-gray-100 pt-4 mt-2">
                        <div className="bg-gray-50 p-3 rounded-2xl text-gray-400 shrink-0">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Data procurării</p>
                            <p className="font-bold text-gray-700 text-md">
                                {new Date(ticket.purchaseDate || Date.now()).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-8 pt-4 pb-8 bg-white">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <button 
                            className="bg-gradient-to-r from-primary to-orange-600 hover:to-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                        >
                            <Download className="w-4 h-4" />
                            PDF
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="bg-white border-2 border-primary text-primary hover:bg-orange-50 font-bold py-3 px-4 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Arată codul la intrare</p>
                </div>
            </div>
        </div>
    );
};

export default TicketView;