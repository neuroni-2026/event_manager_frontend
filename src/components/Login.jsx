import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../services/api';
import { Mail, Lock, MapPin } from 'lucide-react';

const FALLBACK_EVENTS = [
  { id: 101, title: "Concert Rock", desc: "Live music night", date: "DEC 26", location: "Campus", tag: "SOCIAL", img: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=600" },
  { id: 102, title: "Tech Meetup", desc: "Networking IT", date: "JAN 10", location: "Aula Magna", tag: "TECH", img: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=600" },
  { id: 103, title: "Art Gallery", desc: "Modern Art", date: "FEB 05", location: "City Center", tag: "ART", img: "https://images.unsplash.com/photo-1518998053901-5348d3969161?auto=format&fit=crop&w=600" },
  { id: 104, title: "Charity Run", desc: "5k Run", date: "MAR 12", location: "Park", tag: "SPORT", img: "https://images.unsplash.com/photo-1552674605-5d226a5cfb99?auto=format&fit=crop&w=600" },
];

const ANIMATION_LANES = [
    { left: '-25%', delay: '0s', duration: '40s', anim: 'flow-up-right' },
    { left: '-25%', delay: '-20s', duration: '40s', anim: 'flow-up-right' },
    { left: '5%',  delay: '-5s', duration: '45s', anim: 'flow-up-right' },
    { left: '5%',  delay: '-25s', duration: '45s', anim: 'flow-up-right' },
    { left: '25%', delay: '-10s', duration: '48s', anim: 'flow-up-right' },
    { left: '25%', delay: '-30s', duration: '48s', anim: 'flow-up-right' },
    { left: '65%', delay: '-8s', duration: '42s', anim: 'flow-down-left' },
    { left: '65%', delay: '-28s', duration: '42s', anim: 'flow-down-left' },
    { left: '85%', delay: '-2s', duration: '46s', anim: 'flow-down-left' },
    { left: '85%', delay: '-22s', duration: '46s', anim: 'flow-down-left' },
    { left: '-15%', delay: '-8s', duration: '42s', anim: 'flow-down-left' },
    { left: '-15%', delay: '-8s', duration: '42s', anim: 'flow-down-left' },
];

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [backgroundCards, setBackgroundCards] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Optional: Clear token on visit to ensure fresh login
        // localStorage.removeItem('token'); 
        // localStorage.removeItem('user');
    }, []);

    useEffect(() => {
        const fetchBackgroundEvents = async () => {
            try {
                const response = await api.get('/events');
                let eventsData = Array.isArray(response.data) ? response.data : response.data.content;
                let sourceEvents = (eventsData && eventsData.length > 0) ? eventsData.map(evt => {
                    const d = new Date(evt.startTime);
                    return {
                        id: evt.id,
                        title: evt.title,
                        desc: evt.description || "Detalii eveniment...",
                        date: `${d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${d.getDate()}`,
                        location: evt.location || "Online",
                        tag: evt.category || "EVENT",
                        img: evt.imageUrl || FALLBACK_EVENTS[Math.floor(Math.random() * FALLBACK_EVENTS.length)].img
                    };
                }) : FALLBACK_EVENTS;

                const cards = ANIMATION_LANES.map((lane, index) => ({
                    ...lane,
                    id: `bg-card-${index}`,
                    event: sourceEvents[index % sourceEvents.length]
                }));
                setBackgroundCards(cards);
            } catch (err) {
                const cards = ANIMATION_LANES.map((lane, idx) => ({
                    ...lane,
                    id: `fallback-${idx}`,
                    event: FALLBACK_EVENTS[idx % FALLBACK_EVENTS.length]
                }));
                setBackgroundCards(cards);
            }
        };
        fetchBackgroundEvents();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/signin', formData);
            const data = response.data;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            toast.success(`Welcome back, ${data.firstName || 'User'}!`);
            
            const roles = data.roles || [];
            if (roles.some(r => r.toUpperCase().includes('ADMIN'))) navigate('/admin');
            else navigate('/');
        } catch (error) {
            console.error("Login Error:", error);
            toast.error("Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper relative min-h-[calc(100vh-80px)] w-full overflow-hidden flex justify-center items-center bg-white font-['Inter',_sans-serif] py-12">
            <style>{`
                @keyframes flow-up-right { 
                    0% { transform: translate(-400px, 120vh); } 
                    100% { transform: translate(120vw, -400px); } 
                }
                @keyframes flow-down-left { 
                    0% { transform: translate(120vw, -400px); } 
                    100% { transform: translate(-400px, 120vh); } 
                }
                .animated-background.blurred {
                    filter: blur(8px) brightness(0.95);
                    transform: scale(1.02);
                }
            `}</style>

            {/* Background Animation */}
            <div className={`animated-background absolute top-0 left-0 w-full h-full z-0 pointer-events-none transition-all duration-400 opacity-60 ${isFocused ? 'blurred' : ''}`}>
                {backgroundCards.map((card) => (
                    <div key={card.id} className="floating-lane-container absolute will-change-transform"
                        style={{
                            left: card.left,
                            animation: `${card.anim} ${card.duration} linear infinite`,
                            animationDelay: card.delay
                        }}>
                        
                        <div className="visual-card bg-white w-[360px] rounded-[20px] shadow-lg overflow-hidden flex flex-col border border-slate-100 opacity-85 text-left rotate-[-12deg]">
                            <div className="relative w-full h-[200px] bg-slate-100">
                                <img src={card.event.img} alt={card.event.title} className="w-full h-full object-cover" />
                                <div className="absolute top-4 left-4 bg-yellow-400 text-black font-bold text-[10px] px-3 py-1 rounded-md uppercase">
                                    {card.event.tag}
                                </div>
                                <div className="absolute top-4 right-4 bg-white text-slate-900 font-bold text-[11px] px-3 py-1 rounded-md shadow-sm">
                                    {card.event.date}
                                </div>
                            </div>
                            <div className="p-6 bg-white flex flex-col flex-grow">
                                <h3 className="text-[18px] font-bold text-slate-900 mb-2 truncate">{card.event.title}</h3>
                                <p className="text-[14px] text-slate-500 mb-4 line-clamp-2 leading-relaxed">{card.event.desc}</p>
                                <div className="mt-auto flex justify-between items-center">
                                    <div className="flex items-center gap-1.5 text-[13px] text-slate-500 font-medium">
                                        <MapPin size={12} className="text-slate-400" /> 
                                        <span className="truncate max-w-[150px]">{card.event.location}</span>
                                    </div>
                                    <button className="bg-slate-50 text-slate-900 px-4 py-2 rounded-lg font-semibold text-[13px] border border-slate-100">
                                        Detalii
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Login Card */}
            <div 
                className="auth-container relative z-10 w-full max-w-[500px] p-4"
                onMouseEnter={() => setIsFocused(true)}
                onMouseLeave={() => setIsFocused(false)}
            >
                <div className="auth-card bg-white rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-black p-10">
                    <div className="auth-header mb-8 text-left">
                        <h2 className="text-[36px] font-extrabold text-slate-900 mb-2 tracking-tight">Bine ai venit!</h2>
                        <p className="text-[16px] text-slate-500 leading-relaxed font-medium">
                            Autentifică-te în contul tău Event Manager
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="input-group">
                            <label className="block text-[15px] font-bold text-slate-900 mb-2">Email</label>
                            <div className="input-wrapper relative w-full">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} />
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="student@upb.ro" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full h-[52px] pl-12 pr-4 border-2 border-black rounded-[12px] bg-[#dfe6e9] text-[15px] text-slate-900 outline-none focus:ring-0 transition-all placeholder-slate-500 font-medium"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="block text-[15px] font-bold text-slate-900 mb-2">Parolă</label>
                            <div className="input-wrapper relative w-full">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} />
                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="••••••••" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full h-[52px] pl-12 pr-4 border-2 border-black rounded-[12px] bg-[#dfe6e9] text-[15px] text-slate-900 outline-none focus:ring-0 transition-all placeholder-slate-500 font-medium"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-[54px] bg-[#ff7675] hover:bg-[#ff6b6b] text-white rounded-[12px] text-[16px] font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? 'Se încarcă...' : 'Autentificare'}
                        </button>
                    </form>

                    <div className="auth-footer mt-8 text-center text-[14px] text-slate-500 font-medium">
                        Nu ai un cont? 
                        <Link to="/register" className="ml-1 text-[#ff7675] font-bold hover:underline">
                            Înregistrează-te
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
