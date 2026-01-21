import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import { Trash2, Upload, FileText, Calendar, Type, MapPin, Clock, Users, ImageIcon, Loader2, X, Eye, Save, ArrowLeft, ChevronDown } from 'lucide-react';
import ConfirmationModal from './ui/ConfirmationModal';
import { motion } from 'framer-motion';

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [materials, setMaterials] = useState([]);
    const [uploading, setUploading] = useState(false);
    
   
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => {},
        isDanger: false
    });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        location: '',
        startTime: '',
        endTime: '',
        maxCapacity: 100,
        imageUrl: ''
    });

    const openConfirmModal = (title, message, onConfirm, isDanger = false) => {
        setModalConfig({ title, message, onConfirm, isDanger });
        setIsModalOpen(true);
    };

    const fetchEvent = async () => {
        try {
            const response = await api.get(`/events/${id}`);
            const e = response.data;
            const formatTime = (isoString) => isoString ? new Date(isoString).toISOString().slice(0, 16) : '';
            
            setFormData({
                title: e.title,
                description: e.description,
                category: e.category,
                location: e.location,
                startTime: formatTime(e.startTime),
                endTime: formatTime(e.endTime),
                maxCapacity: e.maxCapacity,
                imageUrl: e.imageUrl || ''
            });
            setMaterials(e.materials || []);
        } catch (error) {
            console.error("Eroare la incarcare eveniment:", error);
            toast.error("Nu s-au putut încărca datele evenimentului.");
            navigate('/my-events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append("file", file);

        try {
            const response = await api.post('/images/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = response.data.url;
            setFormData({ ...formData, imageUrl: url });
            toast.success("Imagine actualizată!");
        } catch (err) {
            console.error(err);
            toast.error("Eroare la încărcarea imaginii!");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/events/${id}`, formData);
            toast.success("Eveniment actualizat cu succes!");
            navigate('/my-events');
        } catch (error) {
            console.error(error);
            toast.error("Eroare la actualizare.");
        }
    };

    const handleUploadMaterials = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const data = new FormData();
        files.forEach(file => {
            data.append("files", file);
        });

        try {
            await api.post(`/materials/event/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Materiale adăugate cu succes!");
            fetchEvent(); 
        } catch (error) {
            console.error(error);
            toast.error("Eroare la încărcarea materialelor.");
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const handleDeleteMaterial = (materialId) => {
        openConfirmModal(
            "Șterge Material",
            "Sigur vrei să ștergi acest material? Acțiunea este ireversibilă.",
            async () => {
                try {
                    await api.delete(`/materials/${materialId}`);
                    toast.success("Material șters!");
                    setMaterials(materials.filter(m => m.id !== materialId));
                } catch (error) {
                    console.error(error);
                    toast.error("Eroare la ștergerea materialului.");
                }
            },
            true
        );
    };

    const handleDeleteImage = () => {
        openConfirmModal(
            "Șterge Imaginea",
            "Sigur vrei să ștergi imaginea curentă?",
            async () => {
                try {
                    await api.delete(`/images/delete?url=${encodeURIComponent(formData.imageUrl)}`);
                    setFormData(prev => ({ ...prev, imageUrl: '' }));
                    toast.success("Imagine ștearsă!");
                } catch (err) {
                    console.error(err);
                    toast.error("Eroare la ștergerea imaginii.");
                }
            },
            true
        );
    };

    const PreviewCard = () => {
        const dateObj = formData.startTime ? new Date(formData.startTime) : new Date();
        const formattedDate = new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }).format(dateObj);
        
        return (
            <div className="bg-card rounded-[2rem] overflow-hidden shadow-2xl border border-border transform transition-all duration-300 group">
                <div className="relative h-56 bg-muted overflow-hidden">
                    {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground">
                            <ImageIcon className="w-12 h-12 mb-2" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Nicio imagine</span>
                        </div>
                    )}
                    
                    <div className="absolute top-4 left-4 z-20">
                         <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-background/90 backdrop-blur shadow-sm text-primary border border-primary/10">
                            {formData.category || "GENERAL"}
                        </span>
                    </div>
                </div>

                <div className="p-7">
                    <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1">
                        {formData.title || "Titlul Evenimentului"}
                    </h3>
                    
                    <p className="text-muted-foreground text-xs font-normal line-clamp-2 mb-6 leading-relaxed">
                        {formData.description || "Descrierea ta va apărea aici..."}
                    </p>

                    <div className="space-y-2.5 mb-8">
                         <div className="flex items-center text-xs text-muted-foreground gap-2.5">
                            <Calendar className="w-4 h-4 text-primary/60" />
                            <span className="font-medium">{formattedDate}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground gap-2.5">
                            <Clock className="w-4 h-4 text-primary/60" />
                            <span className="font-medium">
                                {formData.startTime ? new Date(formData.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'} 
                                - 
                                {formData.endTime ? new Date(formData.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                            </span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground gap-2.5">
                            <MapPin className="w-4 h-4 text-primary/60" />
                            <span className="line-clamp-1 font-medium">{formData.location || "Locația evenimentului"}</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border">
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Locuri</span>
                            </div>
                            <span className="text-xs font-bold text-primary">0 / {formData.maxCapacity}</span>
                        </div>
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary/20 w-[2%] rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-20 pt-8 transition-colors duration-300">
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
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-12">
                    <button 
                        onClick={() => navigate('/my-events')}
                        className="text-muted-foreground hover:text-primary flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-4 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Înapoi la listă
                    </button>
                    <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
                        Editează <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">Evenimentul</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Actualizează detaliile și conținutul experienței tale.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* LEFT COLUMN: Form  */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-7 space-y-8"
                    >
                        <form onSubmit={handleSubmit} className="space-y-10">
                            
                            {/* Basic Info */}
                            <div className="bg-card rounded-[2rem] shadow-xl shadow-black/5 border border-border p-8 md:p-10">
                                <h3 className="text-lg font-bold text-foreground mb-8 flex items-center gap-3 border-b pb-4 border-border">
                                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                        <Type className="w-5 h-5" />
                                    </div>
                                    Informații Generale
                                </h3>
                                
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Titlu Eveniment</label>
                                        <input 
                                            type="text" 
                                            name="title" 
                                            value={formData.title}
                                            className="w-full px-5 py-3.5 bg-background border-2 border-border rounded-2xl focus:bg-card focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all outline-none font-medium text-foreground" 
                                            required 
                                            onChange={handleChange} 
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Categorie</label>
                                            <div className="relative">
                                                <select 
                                                    name="category" 
                                                    value={formData.category}
                                                    className="w-full px-5 py-3.5 bg-background border-2 border-border rounded-2xl focus:bg-card focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all outline-none appearance-none cursor-pointer font-medium text-foreground"
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Alege...</option>
                                                    <option value="ACADEMIC">Academic</option>
                                                    <option value="SOCIAL">Social</option>
                                                    <option value="CAREER">Carieră</option>
                                                    <option value="SPORT">Sport</option>
                                                    <option value="VOLUNTEERING">Voluntariat</option>
                                                    <option value="OTHER">Altele</option>
                                                </select>
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                    <ChevronDown size={18} />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Locație</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                                <input 
                                                    type="text" 
                                                    name="location" 
                                                    value={formData.location}
                                                    className="w-full pl-12 pr-5 py-3.5 bg-background border-2 border-border rounded-2xl focus:bg-card focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all outline-none font-medium text-foreground"
                                                    required 
                                                    onChange={handleChange} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Descriere Detaliată</label>
                                        <textarea 
                                            name="description" 
                                            value={formData.description}
                                            className="w-full px-5 py-4 bg-background border-2 border-border rounded-2xl focus:bg-card focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all outline-none min-h-[160px] resize-none font-medium text-foreground leading-relaxed"
                                            required 
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Logistics */}
                            <div className="bg-card rounded-[2rem] shadow-xl shadow-black/5 border border-border p-8 md:p-10">
                                <h3 className="text-lg font-bold text-foreground mb-8 flex items-center gap-3 border-b pb-4 border-border">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    Logistică & Acces
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Data și Ora Start</label>
                                        <input 
                                            type="datetime-local" 
                                            name="startTime" 
                                            value={formData.startTime}
                                            className="w-full px-5 py-3.5 bg-background border-2 border-border rounded-2xl focus:bg-card focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all outline-none font-medium text-foreground"
                                            required 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Data și Ora Final</label>
                                        <input 
                                            type="datetime-local" 
                                            name="endTime" 
                                            value={formData.endTime}
                                            className="w-full px-5 py-3.5 bg-background border-2 border-border rounded-2xl focus:bg-card focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all outline-none font-medium text-foreground"
                                            required 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 space-y-2">
                                     <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Capacitate Maximă Locuri</label>
                                     <div className="relative max-w-xs group">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                                        <input 
                                            type="number" 
                                            name="maxCapacity"
                                            min="1"
                                            value={formData.maxCapacity}
                                            className="w-full pl-12 pr-5 py-3.5 bg-background border-2 border-border rounded-2xl focus:bg-card focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all outline-none font-bold text-foreground"
                                            onChange={handleChange}
                                        />
                                     </div>
                                </div>
                            </div>

                             {/* Media & Files */}
                             <div className="bg-card rounded-[2rem] shadow-xl shadow-black/5 border border-border p-8 md:p-10">
                                <h3 className="text-lg font-bold text-foreground mb-8 flex items-center gap-3 border-b pb-4 border-border">
                                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    Media și Documente
                                </h3>

                                <div className="space-y-8">
                                    {/* Image Upload Area */}
                                     <div className="space-y-3">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Imagine de Copertă</label>
                                        <div className={`relative border-2 border-dashed rounded-3xl p-10 transition-all text-center group ${formData.imageUrl ? 'border-primary/30 bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-muted'}`}>
                                            <input 
                                                type="file" 
                                                id="file-upload" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={handleFileChange} 
                                                disabled={uploading}
                                            />
                                            
                                            {uploading ? (
                                                <div className="flex flex-col items-center justify-center py-4">
                                                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
                                                    <span className="text-sm font-medium text-muted-foreground">Se actualizează imaginea...</span>
                                                </div>
                                            ) : formData.imageUrl ? (
                                                <div className="space-y-6">
                                                    <div className="relative group inline-block">
                                                        <img 
                                                            src={formData.imageUrl} 
                                                            alt="Uploaded" 
                                                            className="mx-auto h-52 rounded-2xl shadow-2xl object-cover border-4 border-background" 
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                                            <label htmlFor="file-upload" className="cursor-pointer px-5 py-2 bg-white text-gray-900 rounded-xl text-xs font-bold shadow-sm transition-all transform hover:scale-105 uppercase tracking-wider">
                                                                Schimbă
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-center">
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => { e.preventDefault(); handleDeleteImage(); }}
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-100 dark:border-red-900/30 rounded-xl text-xs font-bold transition-all uppercase tracking-wider"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Șterge Imaginea
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center py-6">
                                                    <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                                        <Upload className="w-10 h-10 text-primary" />
                                                    </div>
                                                    <span className="text-foreground font-bold text-xl">Încarcă Imagine</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    {/* Materials Section */}
                                    <div className="space-y-3">
                                    <div className="flex justify-between items-center mb-2 px-1">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Materiale Atașate</label>
                                        <label className="text-xs font-bold text-blue-600 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-blue-100 dark:border-blue-900/30 shrink-0">
                                            <Upload className="w-3.5 h-3.5" /> Adaugă Fișiere
                                            <input 
                                                type="file" 
                                                multiple 
                                                className="hidden" 
                                                onChange={handleUploadMaterials} 
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                    
                                   
                                    <div className="bg-muted/30 border-2 border-border rounded-[2rem] p-4 sm:p-6 min-h-[100px] w-full overflow-hidden">
                                        {materials.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground w-full">
                                                <FileText className="w-10 h-10 mb-2 opacity-20" />
                                                <p className="text-sm font-medium italic text-center">Nu există materiale încărcate.</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-3 w-full">
                                                {materials.map((m) => (
                                                    <div key={m.id} className="flex items-center justify-between bg-card p-3 sm:p-4 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group w-full min-w-0 overflow-hidden">
                                                        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden min-w-0 flex-1">
                                                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                                <FileText className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                <a 
                                                                    href={m.fileUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="text-sm font-bold text-foreground truncate block hover:text-primary transition-colors"
                                                                    title={m.fileName}
                                                                >
                                                                    {m.fileName}
                                                                </a>
                                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                                                    {m.fileType?.split('/').pop() || 'FILE'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleDeleteMaterial(m.id)} 
                                                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all shrink-0 ml-2"
                                                            title="Șterge material"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                </div>
                            </div>

                            {/* Actions */}
                           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-6">
                            <button 
                                type="submit" 
                                className="flex-1 w-full bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white font-bold py-3.5 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 text-sm uppercase tracking-widest border-none cursor-pointer order-1"
                            >
                                <Save className="w-4 h-4" />
                                <span>Salvează Modificările</span>
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => navigate('/my-events')}
                                className="w-full sm:w-auto px-8 py-3.5 bg-muted hover:bg-muted/80 text-muted-foreground font-bold rounded-2xl text-xs uppercase tracking-widest transition-all order-2 sm:order-none"
                            >
                                Anulează
                            </button>
                        </div>

                        </form>
                    </motion.div>

                    {/*Live Preview*/}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-5 sticky top-24"
                    >
                         <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider pl-1">
                                <Eye className="w-4 h-4" />
                                Live Preview
                            </div>
                            <PreviewCard />
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default EditEvent;
