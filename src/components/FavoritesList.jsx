import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Heart, Trash2, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const FavoritesList = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await api.get('/favorites');
                setFavorites(response.data);
            } catch (error) {
                console.error("Error loading favorites:", error);
                toast.error("Could not load favorites.");
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    const handleRemove = async (e, eventId) => {
        e.preventDefault(); 
        try {
            await api.delete(`/favorites/${eventId}`);
            setFavorites(favorites.filter(f => f.eventId !== eventId));
            toast.success("Eliminat de la favorite.");
        } catch (error) {
            console.error("Error removing favorite:", error);
            toast.error("Nu s-a putut șterge.");
        }
    };

    if (loading) return (
        <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f9fafb] font-['Inter',_sans-serif] py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 flex items-center gap-4">
                    <div className="bg-[#fff4ed] p-4 rounded-[22px] shadow-sm border border-[#ffe0d3]">
                        <Heart className="w-8 h-8 text-[#ff6b6b] fill-[#ff6b6b]" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Evenimente Favorite</h2>
                        <p className="text-gray-500 font-medium mt-1">Evenimentele pe care le-ai salvat pentru mai târziu.</p>
                    </div>
                </div>
                
                {favorites.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm"
                    >
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-10 h-10 text-[#ff6b6b]/40" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Niciun eveniment salvat</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto font-medium">
                            Explorează evenimentele disponibile și salvează-le pe cele care te interesează.
                        </p>
                        <Link 
                            to="/events" 
                            className="inline-flex items-center gap-2 bg-[#ff6b6b] text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-orange-200 hover:-translate-y-0.5 transition-all no-underline"
                        >
                            Explorează Evenimente
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {favorites.map((fav, index) => (
                            <motion.div
                                key={fav.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="group bg-white rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] transition-all duration-300 h-full flex flex-col relative">
                                    
                                    <button 
                                        onClick={(e) => handleRemove(e, fav.eventId)}
                                        className="absolute top-4 right-4 z-20 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-[#ff6b6b] border border-gray-100 shadow-sm transition-all active:scale-90"
                                        title="Elimină"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <Link to={`/events/${fav.eventId}`} className="no-underline block">
                                        <div className="relative h-56 overflow-hidden">
                                            <img 
                                                src={fav.eventImageUrl || "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000&auto=format&fit=crop"} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                                alt={fav.eventTitle} 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-40"></div>
                                            <div className="absolute bottom-4 left-4">
                                                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg px-3 py-1.5 text-white text-xs font-bold">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{new Date(fav.eventDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    
                                    <div className="p-7 flex flex-col flex-grow">
                                        <Link to={`/events/${fav.eventId}`} className="no-underline">
                                            <h5 className="text-[22px] font-bold text-gray-900 mb-4 line-clamp-2 hover:text-[#ff6b6b] transition-colors leading-tight no-underline">
                                                {fav.eventTitle}
                                            </h5>
                                        </Link>
                                        
                                        <div className="mt-auto flex items-center justify-between pt-5 border-t border-gray-50">
                                            <Link to={`/events/${fav.eventId}`} className="no-underline text-sm font-bold text-gray-500 hover:text-[#ff6b6b] transition-colors">
                                                Vezi detalii
                                            </Link>
                                            <Link to={`/events/${fav.eventId}`} className="w-10 h-10 rounded-full bg-[#ff6b6b] flex items-center justify-center text-white shadow-lg shadow-orange-200 transition-transform hover:scale-110 active:scale-95">
                                                <ArrowRight className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesList;