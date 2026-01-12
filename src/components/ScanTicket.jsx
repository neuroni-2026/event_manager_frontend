import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import { Scan, CheckCircle, XCircle, ArrowLeft, Loader2, Camera } from 'lucide-react';
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
        // Initialize scanner instance
        scannerRef.current = new Html5Qrcode(qrRegionId);

        return () => {
            // Clean up on unmount
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
                    // Success callback
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Ignore constant "no QR found" messages
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
        // Start scanner again after a short delay
        setTimeout(() => startScanner(), 500);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-20">
                <button onClick={() => navigate('/my-events')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-400" />
                </button>
                <h1 className="text-lg font-bold flex items-center gap-2">
                    <Scan className="w-5 h-5 text-primary" /> Scaner Eveniment
                </h1>
                <div className="w-10"></div>
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
                            <div className="relative w-full aspect-square bg-black rounded-[2.5rem] overflow-hidden border-2 border-gray-800 shadow-2xl">
                                <div id={qrRegionId} className="w-full h-full"></div>
                                
                                {!isScannerStarted && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 z-10 p-8 text-center">
                                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
                                            <Camera className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Sistem Scanare</h3>
                                        <p className="text-gray-400 text-sm mb-8">Apasă butonul de mai jos pentru a activa camera.</p>
                                        <button 
                                            onClick={startScanner}
                                            className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform uppercase tracking-widest text-xs"
                                        >
                                            Pornește Camera
                                        </button>
                                    </div>
                                )}

                                {loading && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-primary">Validare...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Manual Input */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-gray-600">
                                    <div className="h-px bg-gray-800 flex-grow"></div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Sau introdu manual</span>
                                    <div className="h-px bg-gray-800 flex-grow"></div>
                                </div>

                                <form onSubmit={handleManualSubmit} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Cod Bilet" 
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value)}
                                        className="flex-grow bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3.5 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono"
                                    />
                                    <button 
                                        type="submit" 
                                        className="bg-gray-800 hover:bg-gray-700 text-white px-6 rounded-2xl font-bold transition-colors border border-gray-700"
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
                            className={`w-full p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden ${
                                scanResult.valid ? 'bg-emerald-600' : 
                                scanResult.ticketStatus === 'USED' ? 'bg-amber-500' : 'bg-rose-600'
                            }`}
                        >
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none">
                                <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_24px]"></div>
                            </div>

                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 backdrop-blur-md shadow-inner ring-1 ring-white/30">
                                    {scanResult.valid ? <CheckCircle className="w-12 h-12 text-white" /> : 
                                     scanResult.ticketStatus === 'USED' ? <Scan className="w-12 h-12 text-white" /> : <XCircle className="w-12 h-12 text-white" />}
                                </div>
                                
                                <h2 className="text-3xl font-black text-white mb-2 leading-tight tracking-tight uppercase">
                                    {scanResult.valid ? "ACCES PERMIS" : 
                                     scanResult.ticketStatus === 'USED' ? "DEJA FOLOSIT" : "ACCES RESPINS"}
                                </h2>
                                <p className="text-white/80 font-medium text-lg mb-10 leading-relaxed px-2">{scanResult.message}</p>

                                {(scanResult.valid || scanResult.ticketStatus === 'USED') && (
                                    <div className="bg-black/20 rounded-3xl p-6 mb-10 text-left space-y-4 backdrop-blur-xl border border-white/10">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Participant</p>
                                            <p className="text-xl font-bold text-white">{scanResult.studentName}</p>
                                        </div>
                                        <div className="h-px bg-white/10"></div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Eveniment</p>
                                            <p className="text-sm font-semibold text-white/90 leading-snug">{scanResult.eventTitle}</p>
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={resetScan} 
                                    className="w-full bg-white text-gray-950 py-4.5 rounded-[1.5rem] font-bold text-lg hover:shadow-xl active:scale-95 transition-all shadow-lg border-none"
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