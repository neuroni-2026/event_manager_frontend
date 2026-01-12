import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { Star, User, MessageSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

const EventReviews = ({ eventId }) => {
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [canReview, setCanReview] = useState(false); 
    const [user, setUser] = useState(null);
    const [hoverRating, setHoverRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem('user'));
        setUser(loggedUser);
        if (loggedUser && loggedUser.roles.includes('ROLE_STUDENT')) {
            setCanReview(true);
        }

        fetchReviews();
    }, [eventId]);

    const fetchReviews = async () => {
        try {
            const response = await api.get(`/reviews/event/${eventId}`);
            setReviews(response.data);
        } catch (error) {
            console.error("Eroare la incarcare recenzii:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.comment.trim()) return;

        setSubmitting(true);
        try {
            await api.post('/reviews', { 
                eventId, 
                rating: newReview.rating, 
                comment: newReview.comment 
            });
            setNewReview({ rating: 5, comment: '' });
            fetchReviews(); 
            toast.success("Recenzie adăugată!");
        } catch (error) {
            console.error(error);
            toast.error("Eroare la adăugare recenzie.");
        } finally {
            setSubmitting(false);
        }
    };

    const averageRating = reviews.length 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
        : 0;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-primary" />
                        Recenzii
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{reviews.length}</span>
                    </h3>
                </div>
                {reviews.length > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
                        <span className="text-2xl font-black text-yellow-600">{averageRating}</span>
                        <div className="flex flex-col leading-none">
                            <div className="flex text-yellow-500 text-xs">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className={`w-3 h-3 ${star <= Math.round(averageRating) ? 'fill-current' : 'text-yellow-200'}`} />
                                ))}
                            </div>
                            <span className="text-[10px] text-yellow-700/70 font-medium uppercase tracking-wide">Media</span>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500">Fii primul care lasă o recenzie!</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {reviews.map((rev) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={rev.id} 
                                className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100/50 hover:bg-white hover:shadow-sm transition-all"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm">
                                            {rev.reviewer?.firstName?.[0] || <User className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h6 className="font-bold text-gray-900 text-sm">
                                                {rev.reviewer ? `${rev.reviewer.firstName} ${rev.reviewer.lastName}` : "Anonim"}
                                            </h6>
                                            <span className="text-xs text-gray-400">
                                                {rev.createdAt ? formatDistanceToNow(new Date(rev.createdAt), { addSuffix: true, locale: ro }) : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex text-yellow-400">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className={`w-4 h-4 ${star <= rev.rating ? 'fill-current' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed pl-[52px]">{rev.comment}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {canReview && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <h4 className="font-bold text-gray-900 mb-4">Lasă o părere</h4>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Nota ta</label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <Star 
                                            className={`w-8 h-8 transition-colors ${
                                                star <= (hoverRating || newReview.rating) 
                                                    ? 'fill-yellow-400 text-yellow-400' 
                                                    : 'text-gray-200 hover:text-yellow-200'
                                            }`} 
                                        />
                                    </button>
                                ))}
                                <span className="ml-3 text-sm font-medium text-gray-500">
                                    {hoverRating || newReview.rating} / 5
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Comentariul tău</label>
                            <textarea 
                                rows="3" 
                                value={newReview.comment}
                                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                placeholder="Spune-ne cum a fost experiența ta..."
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none text-sm"
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                <span>Trimite Recenzia</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {!canReview && user && !user.roles.includes('ROLE_STUDENT') && (
                 <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-orange-800 text-sm font-medium text-center">
                    Doar studenții pot lăsa recenzii.
                </div>
            )}
        </div>
    );
};

export default EventReviews;