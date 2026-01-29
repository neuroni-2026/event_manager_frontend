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
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => handleScanSuccess(decodedText),
                (errorMessage) => {}
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
            if (response.data.valid) toast.success("Bilet validat!");
            else toast.error(response.data.message || "Bilet invalid!");
        } catch (error) {
            console.error(error);
            setScanResult({ valid: false, message: "Eroare la conexiune.", ticketStatus: "ERROR" });
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualCode.trim()) handleScanSuccess(manualCode.trim());
    };

    const resetScan = () => {
        setScanResult(null);
        setManualCode('');
        setTimeout(() => startScanner(), 500);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
            {/* Header */}
            <div className="p-4 flex items-center justify-center bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-20 shadow-sm">
                <h1 className="text-lg font-bold flex items-center gap-2">
                    <Scan className="w-5 h-5 text-blue-600" /> Scaner Eveniment
                </h1>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
                <AnimatePresence mode='wait'>
                    {!scanResult ? (
                        <motion.div key="scanner-ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full space-y-8">
                            {/* Camera Box - Vibrant Version */}
                            <div className="relative w-full aspect-square bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl shadow-blue-900/20">
                                <div id={qrRegionId} className="w-full h-full"></div>
                                
                                {!isScannerStarted && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 p-8 text-center text-white">
                                        <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-blue-400/30">
                                            <Camera className="w-10 h-10 text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Sistem Scanare</h3>
                                        <p className="text-slate-400 text-sm mb-8">Activează camera pentru a valida bilete</p>
                                        <button onClick={startScanner} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-900/40 active:scale-95 transition-all uppercase tracking-widest text-xs hover:bg-blue-500">
                                            Pornește Camera
                                        </button>
                                    </div>
                                )}

                                {loading && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-white">Validare...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Manual Input */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <div className="h-px bg-border flex-grow"></div>
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Sau introdu manual</span>
                                    <div className="h-px bg-border flex-grow"></div>
                                </div>

                                <form onSubmit={handleManualSubmit} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Cod Bilet" 
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value)}
                                        className="flex-grow bg-card border border-input rounded-2xl px-5 py-3.5 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono shadow-sm"
                                    />
                                    <button 
                                        type="submit" 
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-2xl font-bold transition-colors border border-primary shadow-lg shadow-primary/20"
                                    >
                                        OK
                                    </button>
                                </form>
                            </div>

                        </motion.div>
                    ) : (
                        /* Result UI - Very Vibrant */
                        <motion.div key="result-ui" initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`w-full p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden text-white ${
                                scanResult.valid ? 'bg-emerald-600' : 
                                scanResult.ticketStatus === 'USED' ? 'bg-amber-500' : 'bg-rose-600'
                            }`}
                        >
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_24px]"></div>
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 backdrop-blur-md shadow-inner ring-1 ring-white/30">
                                    {scanResult.valid ? <CheckCircle className="w-12 h-12" /> : 
                                     scanResult.ticketStatus === 'USED' ? <Scan className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                                </div>
                                <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">
                                    {scanResult.valid ? "ACCES PERMIS" : scanResult.ticketStatus === 'USED' ? "DEJA FOLOSIT" : "ACCES RESPINS"}
                                </h2>
                                <p className="text-white/90 font-medium text-lg mb-10">{scanResult.message}</p>

                                {(scanResult.valid || scanResult.ticketStatus === 'USED') && (
                                    <div className="bg-black/20 rounded-3xl p-6 mb-10 text-left space-y-4 backdrop-blur-xl border border-white/10">
                                        <div><p className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Participant</p><p className="text-xl font-bold">{scanResult.studentName}</p></div>
                                        <div className="h-px bg-white/10"></div>
                                        <div><p className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Eveniment</p><p className="text-sm font-semibold">{scanResult.eventTitle}</p></div>
                                    </div>
                                )}
                                <button onClick={resetScan} className="w-full bg-white text-slate-900 py-4.5 rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all border-none">
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