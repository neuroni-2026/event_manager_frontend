import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Upload, Calendar, MapPin, Type, AlignLeft, Image as ImageIcon, Loader2, FileText, X, Trash2, Eye, Clock, Users, ChevronDown, PlusCircle, Shield, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import ConfirmationModal from './ui/ConfirmationModal';
import { motion } from 'framer-motion';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [materials, setMaterials] = useState([]); 
    
    // Modal State
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
        location: '',
        startTime: '',
        endTime: '',
        maxCapacity: 100,
        category: 'ACADEMIC',
        imageUrl: ''
    });

    const openConfirmModal = (title, message, onConfirm, isDanger = false) => {
        setModalConfig({ title, message, onConfirm, isDanger });
        setIsModalOpen(true);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError('');

        const data = new FormData();
        data.append("file", file);

        try {
            const response = await api.post('/images/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const url = response.data.url;
            setFormData({ ...formData, imageUrl: url });
            toast.success("Imagine încărcată cu succes!");
            
        } catch (err) {
            console.error(err);
            setError("Eroare la încărcarea imaginii!");
            toast.error("Eroare la încărcarea imaginii!");
        } finally {
            setUploading(false);
        }
    };

    const handleMaterialsChange = (e) => {
        if (e.target.files) {
            setMaterials(Array.from(e.target.files));
        }
    };

    const removeMaterial = (index) => {
        setMaterials(materials.filter((_, i) => i !== index));
    };

    const handleDeleteImage = () => {
        if (!formData.imageUrl) return;
        
        openConfirmModal(
            "Șterge Imaginea",
            "Ești sigur că vrei să ștergi această imagine? Acțiunea nu poate fi anulată.",
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (new Date(formData.endTime) <= new Date(formData.startTime)) {
            toast.error("Data de sfârșit trebuie să fie după data de început!");
            return;
        }

        const data = new FormData();
        data.append("event", JSON.stringify(formData));

        materials.forEach(file => {
            data.append("files", file);
        });

        try {
            await api.post('/events', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Eveniment creat cu succes! Așteaptă aprobarea adminului.");
            navigate('/my-events');
        } catch (err) {
            const msg = err.response?.data?.message || "Eroare la creare.";
            setError(msg);
            toast.error(msg);
        }
    };

    // Live Preview Component
    const PreviewCard = () => {
        const dateObj = formData.startTime ? new Date(formData.startTime) : new Date();
        const formattedDate = new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }).format(dateObj);
        
        return (
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 transform transition-all duration-300 group">
                <div className="relative h-56 bg-gray-50 overflow-hidden">
                    {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-300">
                            <ImageIcon className="w-12 h-12 mb-2" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Nicio imagine</span>
                        </div>
                    )}
                    
                    <div className="absolute top-4 left-4 z-20">
                         <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/90 backdrop-blur shadow-sm text-primary border border-primary/10">
                            {formData.category}
                        </span>
                    </div>
                </div>

                <div className="p-7">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                        {formData.title || "Titlul Evenimentului"}
                    </h3>
                    
                    <p className="text-gray-400 text-xs font-normal line-clamp-2 mb-6 leading-relaxed">
                        {formData.description || "Descrierea ta va apărea aici..."}
                    </p>

                    <div className="space-y-2.5 mb-8">
                         <div className="flex items-center text-xs text-gray-500 gap-2.5">
                            <Calendar className="w-4 h-4 text-primary/60" />
                            <span className="font-medium">{formattedDate}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 gap-2.5">
                            <Clock className="w-4 h-4 text-primary/60" />
                            <span className="font-medium">
                                {formData.startTime ? new Date(formData.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'} 
                                - 
                                {formData.endTime ? new Date(formData.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                            </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 gap-2.5">
                            <MapPin className="w-4 h-4 text-primary/60" />
                            <span className="line-clamp-1 font-medium">{formData.location || "Locația evenimentului"}</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-50">
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-gray-300" />
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Locuri</span>
                            </div>
                            <span className="text-xs font-bold text-primary">0 / {formData.maxCapacity}</span>
                        </div>
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary/20 w-[2%] rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 pt-8">
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
                {/* Header */}
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <motion.h1 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3"
                    >
                        Creează un <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">Eveniment Nou</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-500 font-medium"
                    >
                        Împărtășește experiențe și oportunități cu întreaga comunitate.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* LEFT COLUMN: Form (7/12) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-7 space-y-8"
                    >
                        <form onSubmit={handleSubmit} className="space-y-10">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-2">
                                    <X className="w-5 h-5" /> {error}
                                </div>
                            )}

                            {/* Section 1: Basic Info */}
                            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-white p-8 md:p-10">
                                <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                        <Type className="w-5 h-5" />
                                    </div>
                                    Informații Generale
                                </h3>
                                
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Titlu Eveniment</label>
                                        <input 
                                            type="text" 
                                            name="title" 
                                            className="w-full px-5 py-3.5 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all outline-none font-medium text-gray-700 placeholder:text-gray-300" 
                                            placeholder="Ex: Workshop Design Thinking"
                                            required 
                                            onChange={handleChange} 
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Categorie</label>
                                            <div className="relative">
                                                <select 
                                                    name="category" 
                                                    className="w-full px-5 py-3.5 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all outline-none appearance-none cursor-pointer font-medium text-gray-700"
                                                    onChange={handleChange}
                                                >
                                                    <option value="ACADEMIC">Academic</option>
                                                    <option value="SOCIAL">Social</option>
                                                    <option value="CAREER">Carieră</option>
                                                    <option value="SPORT">Sport</option>
                                                    <option value="VOLUNTEERING">Voluntariat</option>
                                                    <option value="OTHER">Altele</option>
                                                </select>
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <ChevronDown size={18} />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Locație</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 h-5 w-5" />
                                                <input 
                                                    type="text" 
                                                    name="location" 
                                                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all outline-none font-medium text-gray-700 placeholder:text-gray-300"
                                                    placeholder="Ex: Aula Corp A"
                                                    required 
                                                    onChange={handleChange} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Descriere Detaliată</label>
                                        <textarea 
                                            name="description" 
                                            className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all outline-none min-h-[160px] resize-none font-medium text-gray-700 placeholder:text-gray-300 leading-relaxed"
                                            placeholder="Povestește-ne mai multe despre acest eveniment..."
                                            required 
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Logistics */}
                            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-white p-8 md:p-10">
                                <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    Logistică & Acces
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Data și Ora Start</label>
                                        <input 
                                            type="datetime-local" 
                                            name="startTime" 
                                            className="w-full px-5 py-3.5 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all outline-none font-medium text-gray-700"
                                            required 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Data și Ora Final</label>
                                        <input 
                                            type="datetime-local" 
                                            name="endTime" 
                                            className="w-full px-5 py-3.5 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all outline-none font-medium text-gray-700"
                                            required 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 space-y-2">
                                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Capacitate Maximă Locuri</label>
                                     <div className="relative max-w-xs group">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 h-5 w-5 group-focus-within:text-primary transition-colors" />
                                        <input 
                                            type="number" 
                                            name="maxCapacity"
                                            min="1"
                                            defaultValue="100"
                                            className="w-full pl-12 pr-5 py-3.5 bg-gray-50/50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all outline-none font-bold text-gray-700"
                                            onChange={handleChange}
                                        />
                                     </div>
                                </div>
                            </div>

                            {/* Section 3: Media & Files */}
                            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-white p-8 md:p-10">
                                <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    Media și Documente
                                </h3>

                                <div className="space-y-8">
                                     {/* Image Upload Area */}
                                     <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Imagine de Copertă</label>
                                        <div className={`relative border-2 border-dashed rounded-3xl p-10 transition-all text-center group ${formData.imageUrl ? 'border-primary/30 bg-primary/5' : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50'}`}>
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
                                                    <span className="text-sm font-medium text-gray-500">Se urcă imaginea...</span>
                                                </div>
                                            ) : formData.imageUrl ? (
                                                <div className="space-y-6">
                                                    <div className="relative group inline-block">
                                                        <img 
                                                            src={formData.imageUrl} 
                                                            alt="Uploaded" 
                                                            className="mx-auto h-52 rounded-2xl shadow-2xl object-cover border-4 border-white" 
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
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-xl text-xs font-bold transition-all uppercase tracking-wider"
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
                                                    <span className="text-gray-900 font-bold text-xl">Alege o imagine</span>
                                                    <span className="text-gray-400 text-sm mt-2 font-medium">Recomandat: 16:9, max 5MB</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    {/* Materials Upload */}
                                    <div className="space-y-3">
                                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Materiale Suport (PDF, DOCX)</label>
                                         <div className="bg-gray-50/50 border-2 border-gray-50 rounded-[2rem] p-6">
                                            <input 
                                                type="file" 
                                                multiple 
                                                onChange={handleMaterialsChange}
                                                className="block w-full text-sm text-gray-400 file:mr-6 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-900 file:text-white file:shadow-lg hover:file:bg-black cursor-pointer transition-all"
                                            />
                                            {materials.length > 0 && (
                                                <div className="mt-6 grid gap-3">
                                                    {materials.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group">
                                                            <div className="flex items-center gap-4 overflow-hidden">
                                                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                                    <FileText className="w-5 h-5" />
                                                                </div>
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="text-sm font-bold text-gray-900 truncate">{file.name}</span>
                                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{(file.size / 1024).toFixed(1)} KB</span>
                                                                </div>
                                                            </div>
                                                            <button type="button" onClick={() => removeMaterial(index)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                         </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6">
                                <button 
                                    type="submit" 
                                    className="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white font-bold py-3.5 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm uppercase tracking-widest border-none cursor-pointer"
                                    disabled={uploading}
                                >
                                    <span>Publică Evenimentul</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* RIGHT COLUMN: Live Preview (5/12) */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="hidden lg:block lg:col-span-5 sticky top-24"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider pl-1">
                                <Eye className="w-4 h-4" />
                                Live Preview
                            </div>
                            <PreviewCard />
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <h4 className="font-bold text-blue-800 text-sm mb-1">Sfat pentru organizatori</h4>
                                <p className="text-sm text-blue-700/80 leading-relaxed">
                                    Folosește o imagine de înaltă calitate (16:9) și un titlu scurt, dar descriptiv (sub 50 de caractere) pentru a atrage mai mulți studenți.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default CreateEvent;