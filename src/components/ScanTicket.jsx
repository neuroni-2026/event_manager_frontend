import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import { Scan, CheckCircle, XCircle, Loader2, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScanTicket = () => {
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [isScannerStarted, setIsScannerStarted] = useState(false);
    const scannerRef = useRef(null);
    const qrRegionId = "reader";

    useEffect(() => {
       
        scannerRef.current = new Html5Qrcode(qrRegionId);

        return () => {
          
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(err => console.error("Error stopping scanner", err));
            }
        };
    }, []);

    const startScanner = async () => {
        if (!scannerRef.current) return;

        try {
            setIsScannerStarted(true);
            await scannerRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
               
                }
            );
        } catch (err) {
            console.error("Failed to start scanner", err);
            toast.error("Nu s-a putut accesa camera.");
            setIsScannerStarted(false);
        }
    };

    const handleScanSuccess = async (code) => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            await scannerRef.current.stop();
            setIsScannerStarted(false);
        }
        await validateTicket(code);
    };

    const validateTicket = async (code) => {
        setLoading(true);
        try {
            const response = await api.post('/tickets/validate', { qrCode: code });
            setScanResult(response.data);
            
            if (response.data.valid) {
                toast.success("Bilet validat!");
            } else {
                toast.error(response.data.message || "Bilet invalid!");
            }
        } catch (error) {
            console.error(error);
            setScanResult({ valid: false, message: "Eroare la conexiune sau cod invalid.", ticketStatus: "ERROR" });
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualCode.trim()) {
            handleScanSuccess(manualCode.trim());
        }
    };

    const resetScan = () => {
        setScanResult(null);
        setManualCode('');
        setTimeout(() => startScanner(), 500);
    };

    const commonGradient = "bg-gradient-to-r from-[#ffffff] to-[#93c5fd]";

    return (
        <div className={`min-h-screen ${commonGradient} text-slate-900 flex flex-col`}>
            {/* Header */}
            <div className={`p-4 flex items-center justify-center ${commonGradient} backdrop-blur-md border-b border-blue-200 sticky top-0 z-20 shadow-sm`}>
                <h1 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <Scan className="w-5 h-5 text-blue-600" /> Scaner Eveniment
                </h1>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
                
                <AnimatePresence mode='wait'>
                    {!scanResult ? (
                        <motion.div 
                            key="scanner-ui"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full space-y-8"
                        >
                            {/* Camera Box */}
                            <div className={`relative w-full aspect-square ${commonGradient} rounded-[2.5rem] overflow-hidden border-2 border-blue-200 shadow-xl shadow-blue-900/5`}>
                                <div id={qrRegionId} className="w-full h-full"></div>
                                
                                {!isScannerStarted && (
                                    <div className={`absolute inset-0 flex flex-col items-center justify-center ${commonGradient} z-10 p-8 text-center`}>
                                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
                                            <Camera className="w-10 h-10 text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 text-slate-800">Sistem Scanare</h3>
                                        <p className="text-slate-500 text-sm mb-8">Apasă butonul de mai jos pentru a activa camera.</p>
                                        <button 
                                            onClick={startScanner}
                                            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform uppercase tracking-widest text-xs hover:bg-blue-700"
                                        >
                                            Pornește Camera
                                        </button>
                                    </div>
                                )}

                                {loading && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20 backdrop-blur-sm">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Validare...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Manual Input Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-slate-400">
                                    <div className="h-px bg-blue-200 flex-grow"></div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Sau introdu manual</span>
                                    <div className="h-px bg-blue-200 flex-grow"></div>
                                </div>

                                <form onSubmit={handleManualSubmit} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Cod Bilet" 
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value)}
                                        className="flex-grow bg-white border border-blue-200 rounded-2xl px-5 py-3.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono shadow-sm"
                                    />
                                    <button 
                                        type="submit" 
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-2xl font-bold transition-colors shadow-lg"
                                    >
                                        OK
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="result-ui"
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`w-full p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden ${commonGradient} border-4 ${
                                scanResult.valid ? 'border-emerald-500' : 
                                scanResult.ticketStatus === 'USED' ? 'border-amber-400' : 'border-rose-500'
                            }`}
                        >
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none">
                                <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_24px]"></div>
                            </div>

                            <div className="relative z-10">
                                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 backdrop-blur-md shadow-inner ring-1 ring-black/5 ${
                                    scanResult.valid ? 'bg-emerald-500/20 text-emerald-600' : 
                                    scanResult.ticketStatus === 'USED' ? 'bg-amber-400/20 text-amber-600' : 'bg-rose-500/20 text-rose-600'
                                }`}>
                                    {scanResult.valid ? <CheckCircle className="w-12 h-12" /> : 
                                     scanResult.ticketStatus === 'USED' ? <Scan className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                                </div>
                                
                                <h2 className={`text-3xl font-black mb-2 leading-tight tracking-tight uppercase ${
                                    scanResult.valid ? 'text-emerald-600' : 
                                    scanResult.ticketStatus === 'USED' ? 'text-amber-600' : 'text-rose-600'
                                }`}>
                                    {scanResult.valid ? "ACCES PERMIS" : 
                                     scanResult.ticketStatus === 'USED' ? "DEJA FOLOSIT" : "ACCES RESPINS"}
                                </h2>
                                <p className="text-slate-700 font-medium text-lg mb-10 leading-relaxed px-2">{scanResult.message}</p>

                                {(scanResult.valid || scanResult.ticketStatus === 'USED') && (
                                    <div className="bg-white/40 rounded-3xl p-6 mb-10 text-left space-y-4 backdrop-blur-md border border-blue-100 shadow-inner">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Participant</p>
                                            <p className="text-xl font-bold text-slate-800">{scanResult.studentName}</p>
                                        </div>
                                        <div className="h-px bg-blue-100"></div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Eveniment</p>
                                            <p className="text-sm font-semibold text-slate-700 leading-snug">{scanResult.eventTitle}</p>
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={resetScan} 
                                    className="w-full bg-slate-900 text-white py-4 rounded-[1.5rem] font-bold text-lg hover:bg-black active:scale-95 transition-all shadow-lg border-none"
                                >
                                    Scanează Următorul
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ScanTicket;