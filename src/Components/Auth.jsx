import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { toast } from 'react-hot-toast'; 
import api from '../services/api';
import { Mail, Lock, User, Phone, MapPin, Building2, GraduationCap, University, Calendar, Timer, User2 } from 'lucide-react';
import { CgOrganisation } from 'react-icons/cg';
import { useLocation } from 'react-router-dom';

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

const AuthPage = () => {
 const location = useLocation();
  const navigate = useNavigate();

  const isLogin = location.pathname === '/auth/signin';

  const [isFocused, setIsFocused] = useState(false);
  const [backgroundCards, setBackgroundCards] = useState([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'student',
    faculty: '',
    studentYear: '',
    organizationName: '',
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  

  
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
  const { name, value } = e.target;

  if (name === "phoneNumber") {

    const onlyNums = value.replace(/[^0-9]/g, '');
    
  
    if (onlyNums.length <= 10) {
      setFormData({
        ...formData,
        [name]: onlyNums
      });
    }
  } else {
    
    setFormData({
      ...formData,
      [name]: value
    });
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setMessage(''); 
    setError('');

    if (!isLogin && formData.password !== formData.confirmPassword) { 
        setError("Parolele nu coincid!"); 
        return; 
    }
    
    const endpoint = isLogin ? '/auth/signin' : '/auth/signup';
    
   
    let bodyData;
    
    if (isLogin) {
        bodyData = { email: formData.email, password: formData.password };
    } else {
        bodyData = { 
            firstName: formData.firstName, 
            lastName: formData.lastName, 
            email: formData.email, 
            password: formData.password, 
            phoneNumber: formData.phoneNumber, 
            role: formData.role,
            
            ...(formData.role === 'student' && { 
                faculty: formData.faculty, 
                yearOfStudy: formData.studentYear ? parseInt(formData.studentYear) : null
            }),
           
            ...(formData.role === 'organizer' && { 
                organizationName: formData.organizationName 
            }),
        };
    }

    try {
      const response = await api.post(endpoint, bodyData);
      const data = response.data;
      
      if (isLogin) {
        localStorage.setItem('user', JSON.stringify(data));
        const roles = data.roles || [];
        if (roles.some(r => r.toUpperCase().includes('ADMIN'))) navigate('/home');
        else if (roles.some(r => r.toUpperCase().includes('ORGANIZER'))) navigate('/home');
        else navigate('/home');
      } else {
        setMessage("Cont creat cu succes! Te rugăm să te autentifici.");
        setIsLogin(true);
        
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (err) {
      console.error("Eroare la submit:", err);
      setError(err.response?.data?.message || err.message || 'Eroare de autentificare.');
    }
  };

  return (
    <div className="auth-wrapper">
      
    
      <div className={`animated-background ${isFocused ? 'blurred' : ''}`}>
        {backgroundCards.map((card) => (
          <div key={card.id} className="floating-lane-container" 
            style={{ 
                left: card.left, 
                animation: `${card.anim} ${card.duration} linear infinite`, 
                animationDelay: card.delay 
            }}>
          
            <div className="visual-card">
                <div className="card-image-header">
                  <img src={card.event.img} alt={card.event.title} />
                  <div className="tag-social">{card.event.tag}</div>
                  <div className="tag-date">{card.event.date}</div>
                </div>
                <div className="card-body">
                  <div className="card-title">{card.event.title}</div>
                  <div className="card-desc">{card.event.desc}</div>
                  <div className="card-footer">
                    <div className="card-location"><MapPin size={12} /> {card.event.location}</div>
                    <button className="btn-details">Detalii</button>
                  </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      
      <div 
        className="auth-container"
        onMouseEnter={() => setIsFocused(true)}
        onMouseLeave={() => setIsFocused(false)}
      >
        <div className="auth-card" style={{border:"solid 2px black"}}>
          <div className="auth-header">
            <h2 className="auth-title">{isLogin ? 'Bine ai venit!' : 'Creează cont'}</h2>
            <p className="auth-subtitle">
                {isLogin ? 'Autentifică-te în contul tău Event Manager' : 'Alătură-te Event Manager și descoperă evenimente uimitoare.'}
            </p>
          </div>

          {error && <div className="msg-error">{error}</div>}
          {message && <div className="msg-success">{message}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <div className="input-group" >
                  <label>Prenume</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input type="text" name="firstName" placeholder="Ion" value={formData.firstName} onChange={handleChange} required style={{border:"solid 2px black", borderRadius:"10px", padding:"0 16px 0 44px", backgroundColor:" #f3f3f3"}}/>
                  </div>
                </div>
                <div className="input-group">
                  <label>Nume</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input type="text" name="lastName" placeholder="Popescu" value={formData.lastName} onChange={handleChange} required style={{border:"solid 2px black", borderRadius:"10px", padding:"0 16px 0 44px", backgroundColor:" #f3f3f3"}}/>
                  </div>
                </div>
              </div>
            )}
            
            {!isLogin && (
                <div className="input-group">
                  <label>Telefon</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" size={18} />
                    <input type="tel" name="phoneNumber" placeholder="07xx xxx xxx" value={formData.phoneNumber} onChange={handleChange} required maxLength="10" pattern="[0-9]{10}"  title="Numărul de telefon trebuie să conțină exact 10 cifre" style={{border:"solid 2px black", borderRadius:"10px", padding:"0 16px 0 44px", backgroundColor:" #f3f3f3"}}
                    />
                  </div>
                </div>
            )}

            <div className="input-group" >
              <label >Email</label>
              <div className="input-wrapper" >
                <Mail className="input-icon" size={18} />
                <input type="email" name="email" placeholder="student@university.edu" value={formData.email} onChange={handleChange} required style={{border:"solid 2px black", borderRadius:"10px", padding:"0 16px 0 44px", backgroundColor:" #f3f3f3"}}/>
              </div>
            </div>

          
            {!isLogin && (
              <>
                

                {formData.role === 'student' && (
                
                    <div className="student-fields-group">
                        <div className="input-group">
                            <label>Facultate</label>
                            <div className="input-wrapper">
                                <Building2 className="input-icon" size={18} />
                                <select name="faculty" value={formData.faculty} onChange={handleChange} style={{border:"solid 2px black", borderRadius:"10px", padding:"0 16px 0 44px", backgroundColor:" #f3f3f3"}} required={formData.role === 'student'} >
                                    <option value="">Selectează facultatea</option>
                                    <option value="FIESC">FIESC</option>
                                    <option value="FEAA">FEAA</option>
                                    <option value="FIM">FIM</option>
                                    <option value="FLSC">FLSC</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>An de studiu</label>
                            <div className="input-wrapper">
                                <Timer className="input-icon" size={18} />
                                <select name="studentYear" value={formData.studentYear} onChange={handleChange} style={{border:"solid 2px black", borderRadius:"10px", padding:"0 16px 0 44px", backgroundColor:" #f3f3f3"}} required={formData.role === 'student'}>
                                    <option value="">Selectează anul</option>
                                    <option value="1">Anul 1</option>
                                    <option value="2">Anul 2</option>
                                    <option value="3">Anul 3</option>
                                    <option value="4">Anul 4</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                
                {formData.role === 'organizer' && (

                    <div className="input-group">
                        <label>Nume Organizație</label>
                        <div className="input-wrapper">
                            <CgOrganisation className="input-icon" size={18} />
                            <input 
                                type="text" 
                                name="organizationName" 
                                placeholder="Ex: Liga Studenților" 
                                value={formData.organizationName} 
                                onChange={handleChange} 
                               style={{border:"solid 2px black", borderRadius:"10px", padding:"0 16px 0 44px", backgroundColor:" #f3f3f3"}}
                                required={formData.role === 'organizer'}
                            />
                        </div>
                    </div>
                )}
              
              </>
            )}
              
           

            <div className="input-group">
              <label>Parolă</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required style={{border:"solid 2px black", borderRadius:"10px", padding:"0 16px 0 44px", backgroundColor:" #f3f3f3"}}/>
              </div>
            </div>

            {!isLogin && (
               <div className="input-group">
                <label>Confirmă parola</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required style={{border:"solid 2px black", borderRadius:"10px", padding:"0 16px 0 44px", backgroundColor:" #f3f3f3"}}/>
                </div>
              </div>
            )}

            <button type="submit" className="auth-btn">
                {isLogin ? 'Autentificare' : 'Creează cont'}
            </button>

          </form>
          
          <div className="auth-footer">
            {isLogin ? 'Nu ai un cont? ' : 'Ai deja un cont? '}
           <span
  className="link-text"
  onClick={() => {
    setError('');
    navigate(isLogin ? '/auth/signup' : '/auth/signin');
  }}
>
              {isLogin ? 'Înregistrează-te' : 'Autentifică-te'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;