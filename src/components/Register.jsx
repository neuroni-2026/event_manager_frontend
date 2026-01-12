import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../services/api';
import { Mail, Lock, User, Phone, Building2, Timer, User2, MapPin } from 'lucide-react';
import { CgOrganisation } from 'react-icons/cg';

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

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
        phoneNumber: '', role: 'student', faculty: '', studentYear: '', organizationName: ''
    });
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [backgroundCards, setBackgroundCards] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchBackgroundEvents = async () => {
            try {
                const response = await api.get('/events');
                let eventsData = Array.isArray(response.data) ? response.data : response.data.content;
                let sourceEvents = (eventsData && eventsData.length > 0) ? eventsData.map(evt => {
                    const d = new Date(evt.startTime);
                    return {
                        id: evt.id, title: evt.title, desc: evt.description || "Detalii...",
                        date: `${d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${d.getDate()}`,
                        location: evt.location || "Online", tag: evt.category || "EVENT",
                        img: evt.imageUrl || FALLBACK_EVENTS[Math.floor(Math.random() * FALLBACK_EVENTS.length)].img
                    };
                }) : FALLBACK_EVENTS;

                const cards = ANIMATION_LANES.map((lane, index) => ({
                    ...lane, id: `bg-card-${index}`, event: sourceEvents[index % sourceEvents.length]
                }));
                setBackgroundCards(cards);
            } catch (err) {
                const cards = ANIMATION_LANES.map((lane, idx) => ({ 
                    ...lane, id: `fallback-${idx}`, event: FALLBACK_EVENTS[idx % FALLBACK_EVENTS.length] 
                }));
                setBackgroundCards(cards);
            }
        };
        fetchBackgroundEvents();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "phoneNumber") {
            const onlyNums = value.replace(/[^0-9]/g, '');
            if (onlyNums.length <= 10) setFormData({ ...formData, [name]: onlyNums });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Parolele nu coincid!"); return;
        }
        setLoading(true);
        try {
            const signupData = {
                firstName: formData.firstName, lastName: formData.lastName,
                email: formData.email, password: formData.password,
                phoneNumber: formData.phoneNumber, role: formData.role,
                ...(formData.role === 'student' && { faculty: formData.faculty, yearOfStudy: formData.studentYear ? parseInt(formData.studentYear) : null }),
                ...(formData.role === 'organizer' && { organizationName: formData.organizationName }),
            };
            await api.post('/auth/signup', signupData);
            toast.success("Cont creat cu succes!");
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || "Eroare la înregistrare.");
        } finally { setLoading(false); }
    };

    const inputClasses = "w-full h-[48px] pl-12 pr-4 border-2 border-black rounded-[12px] bg-[#dfe6e9] text-[15px] text-slate-900 outline-none focus:ring-0 transition-all placeholder-slate-500 font-medium";
    const labelClasses = "block text-[14px] font-bold text-slate-900 mb-2";

    return (
        <div className="auth-wrapper relative min-h-[calc(100vh-80px)] w-full overflow-x-hidden flex justify-center items-center bg-white font-['Inter',_sans-serif] py-20">
             <style>{`
                @keyframes flow-up-right { 0% { transform: translate(-400px, 120vh); } 100% { transform: translate(120vw, -400px); } }
                @keyframes flow-down-left { 0% { transform: translate(120vw, -400px); } 100% { transform: translate(-400px, 120vh); } }
                .animated-background.blurred { filter: blur(8px) brightness(0.95); transform: scale(1.02); }
            `}</style>

            <div className={`animated-background fixed top-0 left-0 w-full h-full z-0 pointer-events-none transition-all duration-400 opacity-60 ${isFocused ? 'blurred' : ''}`}>
                {backgroundCards.map((card) => (
                    <div key={card.id} className="floating-lane-container absolute will-change-transform"
                        style={{ left: card.left, animation: `${card.anim} ${card.duration} linear infinite`, animationDelay: card.delay }}>
                        <div className="bg-white w-[360px] rounded-[20px] shadow-lg overflow-hidden flex flex-col border border-slate-100 opacity-85 text-left rotate-[-12deg]">
                            <div className="relative w-full h-[200px] bg-slate-100">
                                <img src={card.event.img} alt="" className="w-full h-full object-cover" />
                                <div className="absolute top-4 left-4 bg-yellow-400 text-black font-bold text-[10px] px-3 py-1 rounded-md uppercase">{card.event.tag}</div>
                                <div className="absolute top-4 right-4 bg-white text-slate-900 font-bold text-[11px] px-3 py-1 rounded-md shadow-sm">{card.event.date}</div>
                            </div>
                            <div className="p-6 bg-white">
                                <h3 className="text-[18px] font-bold text-slate-900 mb-2 truncate">{card.event.title}</h3>
                                <p className="text-[14px] text-slate-500 mb-4 line-clamp-2">{card.event.desc}</p>
                                <div className="flex justify-between items-center text-[13px] text-slate-500 font-medium">
                                    <div className="flex items-center gap-1.5"><MapPin size={12} /> {card.event.location}</div>
                                    <button className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">Detalii</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="auth-container relative z-10 w-full max-w-[500px] p-4" onMouseEnter={() => setIsFocused(true)} onMouseLeave={() => setIsFocused(false)}>
                <div className="auth-card bg-white rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-black p-10">
                    <div className="mb-8 text-left">
                        <h2 className="text-[36px] font-extrabold text-slate-900 mb-2 tracking-tight">Creează Cont</h2>
                        <p className="text-[16px] text-slate-500 font-medium">Alătură-te Event Manager astăzi.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div><label className={labelClasses}>Prenume</label><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} /><input type="text" name="firstName" placeholder="Ion" value={formData.firstName} onChange={handleChange} required className={inputClasses} /></div></div>
                        <div><label className={labelClasses}>Nume</label><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} /><input type="text" name="lastName" placeholder="Popescu" value={formData.lastName} onChange={handleChange} required className={inputClasses} /></div></div>
                        <div><label className={labelClasses}>Telefon</label><div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} /><input type="tel" name="phoneNumber" placeholder="07xxxxxxxx" value={formData.phoneNumber} onChange={handleChange} required className={inputClasses} /></div></div>
                        <div><label className={labelClasses}>Email</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} /><input type="email" name="email" placeholder="student@university.edu" value={formData.email} onChange={handleChange} required className={inputClasses} /></div></div>
                        
                        <div className="space-y-5">
                            <div><label className={labelClasses}>Facultate</label><div className="relative"><Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} /><select name="faculty" value={formData.faculty} onChange={handleChange} required className={inputClasses + " appearance-none"}><option value="">Selectează</option><option value="FIESC">FIESC</option><option value="FEAA">FEAA</option><option value="FIM">FIM</option><option value="FLSC">FLSC</option></select></div></div>
                            <div><label className={labelClasses}>An Studiu</label><div className="relative"><Timer className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} /><select name="studentYear" value={formData.studentYear} onChange={handleChange} required className={inputClasses + " appearance-none"}><option value="">Selectează</option><option value="1">Anul 1</option><option value="2">Anul 2</option><option value="3">Anul 3</option><option value="4">Anul 4</option></select></div></div>
                        </div>

                        <div><label className={labelClasses}>Parolă</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} /><input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className={inputClasses} /></div></div>
                        <div><label className={labelClasses}>Confirmă</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} /><input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required className={inputClasses} /></div></div>

                        <button type="submit" disabled={loading} className="w-full h-[54px] bg-[#ff7675] hover:bg-[#ff6b6b] text-white rounded-[12px] text-[16px] font-bold shadow-lg transition-all active:scale-[0.98] mt-4">
                            {loading ? 'Se încarcă...' : 'Creează cont'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-[14px] text-slate-500 font-medium">Ai deja un cont? <Link to="/login" className="text-[#ff7675] font-bold hover:underline">Autentifică-te</Link></div>
                </div>
            </div>
        </div>
    );
};

export default Register;
