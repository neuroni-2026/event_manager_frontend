import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaGraduationCap, FaBuilding, FaUniversity, FaMapMarkerAlt } from 'react-icons/fa';

const FALLBACK_EVENTS = [
  { id: 101, title: "Concert Rock", desc: "O noapte incendiară...", date: "DEC 26", location: "Campus", tag: "SOCIAL", img: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=300" },
  { id: 102, title: "Tech Meetup", desc: "Viitorul în IT...", date: "JAN 10", location: "Aula Magna", tag: "EDUCATIONAL", img: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=300" },
  { id: 103, title: "Art Gallery", desc: "Expoziție modernă...", date: "FEB 05", location: "Centru", tag: "CULTURAL", img: "https://images.unsplash.com/photo-1518998053901-5348d3969161?auto=format&fit=crop&w=300" },
  { id: 104, title: "Maraton", desc: "Aleargă pentru cauză...", date: "MAR 12", location: "Parc", tag: "SPORT", img: "https://images.unsplash.com/photo-1552674605-5d226a5cfb99?auto=format&fit=crop&w=300" },
  { id: 105, title: "Workshop AI", desc: "Inteligență Artificială...", date: "APR 20", location: "Lab C", tag: "WORKSHOP", img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=300" },
];

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [backgroundEvents, setBackgroundEvents] = useState([]);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    phoneNumber: '', role: 'student', faculty: '', studentYear: '', organizationName: '',
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  
  const enhanceEventsWithRandomness = (events) => {
    const multiplied = [...events, ...events, ...events].slice(0, 15);
    
    return multiplied.map(evt => {
      
      const startTop = Math.random() * 100;
      const startLeft = Math.random() * 100;

      
      const rotation = -20 + Math.random() * 60 + 'deg'; 

    
     
      const distance = 300 + Math.random() * 200;
      
     
      const moveX = distance + 'px';
      const moveY = (-distance) + 'px'; 

      
      const duration = 15 + Math.random() * 15 + 's';
      const delay = Math.random() * -15 + 's';

      return {
        ...evt,
        style: {
          top: `${startTop}%`,
          left: `${startLeft}%`,
          '--rot': rotation,
          '--tx': moveX,
          '--ty': moveY,
          animationName: 'floatAnimation',
          animationDuration: duration,
          animationDelay: delay,
          animationIterationCount: 'infinite',
          animationDirection: 'alternate', 
          animationTimingFunction: 'ease-in-out'
        }
      };
    });
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events'); 
        let eventsData = Array.isArray(response.data) ? response.data : response.data.content;
        
        if (!eventsData || eventsData.length === 0) {
          setBackgroundEvents(enhanceEventsWithRandomness(FALLBACK_EVENTS));
        } else {
          const mapped = eventsData.map((evt, idx) => ({
             id: evt.id || idx,
             title: evt.name || evt.title || "Eveniment",
             desc: evt.description ? evt.description.substring(0, 20) + "..." : "Detalii...",
             date: evt.date ? new Date(evt.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}).toUpperCase() : "DATE",
             location: evt.location || "Suceava",
             tag: "SOCIAL",
             img: evt.imageUrl || FALLBACK_EVENTS[idx % FALLBACK_EVENTS.length].img
          }));
          setBackgroundEvents(enhanceEventsWithRandomness(mapped));
        }
      } catch (err) {
        setBackgroundEvents(enhanceEventsWithRandomness(FALLBACK_EVENTS));
      }
    };
    fetchEvents();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsFocused(false); };

 
  const handleSubmit = async (e) => {
    e.preventDefault(); setMessage(''); setError('');
    
    if (!isLogin && formData.password !== formData.confirmPassword) { 
        setError("Parolele nu coincid!"); 
        return; 
    }
    
    const endpoint = isLogin ? '/auth/signin' : '/auth/signup';
    let bodyData = isLogin ? { email: formData.email, password: formData.password } : 
    { firstName: formData.firstName, lastName: formData.lastName, email: formData.email, password: formData.password, phoneNumber: formData.phoneNumber, role: formData.role,
      ...(formData.role === 'student' && { studentFaculty: formData.faculty, studentYear: formData.studentYear ? parseInt(formData.studentYear) : null }),
      ...(formData.role === 'organizer' && { organizationName: formData.organizationName }) };

    try {
      const response = await api.post(endpoint, bodyData);
      const data = response.data;

      if (isLogin) {
        localStorage.setItem('user', JSON.stringify(data));
        
       
        const roles = data.roles || [];
        
       
        if (roles.some(role => role.toUpperCase().includes('ADMIN'))) {
            navigate('/home'); 
        } 
        
        else if (roles.some(role => role.toUpperCase().includes('ORGANIZER'))) {
            navigate('/home'); 
        } 
        
        else {
            navigate('/home');
        }

      } else {
        setMessage("Cont creat! Te rugăm să te autentifici.");
        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Eroare.');
    }
  };

  return (
    <div className="auth-wrapper">
      
    
      <div className={`animated-background ${isFocused ? 'blurred' : ''}`}>
        {backgroundEvents.map((evt, idx) => (
          <div key={`${evt.id}-${idx}`} className="floating-card" style={evt.style}>
            <div className="card-image-header">
              <img src={evt.img} alt={evt.title} />
              <div className="tag-social">{evt.tag}</div>
              <div className="tag-date">{evt.date}</div>
            </div>
            <div className="card-body">
              <div className="card-title">{evt.title}</div>
              <div className="card-desc">{evt.desc}</div>
              <div className="card-footer">
                <div className="card-location">
                  <FaMapMarkerAlt color="#ff6b6b" /> {evt.location}
                </div>
                <button className="btn-details">Detalii</button>
              </div>
            </div>
          </div>
        ))}
      </div>

    
      <div 
        className="auth-container"
        onMouseEnter={handleFocus}
        onMouseLeave={() => setIsFocused(false)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <div className="auth-card">
          <h2 className="auth-title">{isLogin ? 'Bine ai venit!' : 'Creează cont'}</h2>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Autentifică-te în contul tău Event Manager' 
              : 'Completează detaliile pentru a te înregistra.'}
          </p>

          {error && <div style={{color:'#ef4444', marginBottom:15, textAlign:'center', fontSize:14}}>{error}</div>}
          {message && <div style={{color:'#10b981', marginBottom:15, textAlign:'center', fontSize:14}}>{message}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-row">
                <div className="input-group">
                  <label>Prenume</label>
                  <div className="input-wrapper">
                    <FaUser className="input-icon" />
                    <input type="text" name="firstName" placeholder="Ion" value={formData.firstName} onChange={handleChange} required  style={{border:"solid 2px black", borderRadius:"12px", padding:"0 20px 0 55px"}}/>
                  </div>
                </div>
                <div className="input-group">
                  <label>Nume</label>
                  <div className="input-wrapper">
                    <FaUser className="input-icon" />
                    <input type="text" name="lastName" placeholder="Popescu" value={formData.lastName} onChange={handleChange} required style={{border:"solid 2px black", borderRadius:"12px", padding:"0 20px 0 55px"}}/>
                  </div>
                </div>
              </div>
            )}
            
            {!isLogin && (
             <div className="input-group">
               <label>Telefon</label>
               <div className="input-wrapper">
                 <FaPhone className="input-icon" />
                 <input type="tel" name="phoneNumber" placeholder="07xx xxx xxx" value={formData.phoneNumber} onChange={handleChange} required style={{border:"solid 2px black"}}/>
               </div>
             </div>
            )}

            <div className="input-group" >
              <label>Email</label>
              <div className="input-wrapper" >
                <FaEnvelope className="input-icon" />
                <input type="email" name="email" placeholder="student@university.edu" value={formData.email} onChange={handleChange} required  style={{border:"solid 2px black"}}/>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="input-group">
                  <label>Facultate</label>
                  <div className="input-wrapper">
                    <FaUniversity className="input-icon" />
                    {formData.role === 'student' ? (
                        <select name="faculty" value={formData.faculty} onChange={handleChange} style={{paddingLeft:'55px',border:"solid 2px black"}}>
                          <option value="">Selectează facultatea</option>
                          <option value="FIESC">FIESC</option>
                          <option value="FEAA">FEAA</option>
                          <option value="Litere">Litere</option>
                          <option value="Mecanica">Mecanică</option>
                        </select>
                    ) : (
                         <input type="text" name="faculty" placeholder="Nume Instituție" value={formData.faculty} onChange={handleChange} />
                    )}
                  </div>
                </div>

                <div className="input-group">
                   <label>Tip de cont</label>
                   <div className="input-wrapper" >
                      <select name="role" value={formData.role} onChange={handleChange} style={{paddingLeft:'20px',border:"solid 2px black"}} > 
                        <option value="student">Student</option>
                        <option value="organizer">Organizator</option>
                      </select>
                   </div>
                </div>
              </>
            )}

            <div className="input-group">
              <label>Parolă</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required style={{border:"solid 2px black"}}/>
              </div>
            </div>

            {!isLogin && (
               <div className="input-group">
                <label>Confirmă parola</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required style={{border:"solid 2px black"}}/>
                </div>
              </div>
            )}

            <button type="submit" className="auth-btn">
              {isLogin ? 'Autentificare' : 'Creează cont'}
            </button>

            <div className="separator">
               <span>Sau continuă cu</span>
            </div>

            <button type="button" className="idp-btn">
               <FaUniversity size={20}/> idp.usv.ro
            </button>

          </form>

          <div className="auth-footer">
            {isLogin ? 'Nu ai un cont? ' : 'Ai deja un cont? '}
            <span className="link-text" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
              {isLogin ? 'Înregistrează-te' : 'Autentifică-te'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;