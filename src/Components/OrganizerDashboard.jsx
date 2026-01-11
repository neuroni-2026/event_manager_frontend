import React, { useState, useCallback, useEffect } from 'react';
import api from '../services/api'; 
import './OrganizerDashboard.css';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; 
import ParticipantsModal from './ParticipantsModal';
import ReviewsModal from './ReviewsModal';
import { 
  Calendar, MapPin, Clock, Users, ImageIcon, Type, 
  LayoutDashboard, CheckCircle, Hourglass, AlertCircle, 
  Star, Plus, Search, ArrowRight, Ban, X, Pencil, Trash2, MessageSquare, Upload,
  TimerIcon,
  User
} from 'lucide-react';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Flag pentru editare
  const [currentEventId, setCurrentEventId] = useState(null); // ID-ul evenimentului editat
  
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedEventForParticipants, setSelectedEventForParticipants] = useState(null);
  const [selectedEventForReviews, setSelectedEventForReviews] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [announcement, setAnnouncement] = useState("");

  // Calculăm media rating-urilor pentru toate evenimentele care au recenzii
const calculateGlobalRating = () => {
    // Filtrăm doar evenimentele care au primit cel puțin o notă
    const eventsWithRatings = myEvents.filter(e => e.averageRating && e.averageRating > 0);
    
    if (eventsWithRatings.length === 0) return "N/A";

    const sum = eventsWithRatings.reduce((acc, curr) => acc + curr.averageRating, 0);
    const average = sum / eventsWithRatings.length;
    
    return average.toFixed(1); // Returnăm cu o singură zecimală (ex: 4.8)
};

const globalRating = calculateGlobalRating();
  const [formData, setFormData] = useState({
    title: '', description: '', location: '', 
    startTime: '', endTime: '', 
    maxCapacity: '100', imageUrl: '', category: 'ACADEMIC'
  });

  const removeSelectedFile = (index) => {
    setSelectedMaterials(prevFiles => prevFiles.filter((_, i) => i !== index));
};
  const fetchMyEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/events/my-events'); 
      setMyEvents(response.data);
    } catch (error) {
      toast.error("Eroare la încărcarea evenimentelor.");
    } finally {
      setLoading(false);
    }
  }, []);

 useEffect(() => {
  const checkStatusAndFetch = async () => {
    // 1. Verificăm dacă există utilizator logat
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/auth/signin');
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      
      // 2. Opțional: Re-verificăm statusul de la server pentru siguranță (Banned/Suspended)
      // Dacă backend-ul tău nu permite /admin/users pentru organizatori, 
      // poți folosi doar datele din localStorage sau un endpoint de /me.
      const res = await api.get(`/admin/users`); 
      const currentUser = res.data.find(u => u.id === userObj.id);

      if (currentUser) {
        const now = new Date();
        const isBanned = currentUser.isEnabled === false;
        const isSuspended = currentUser.suspendedUntil && new Date(currentUser.suspendedUntil) > now;

        if (isBanned || isSuspended) {
          setRestriction({
            isRestricted: true,
            msg: isBanned 
              ? "Contul tău este BLOCAT (BAN). Nu poți crea evenimente noi." 
              : `Activitatea ta este SUSPENDATĂ până la ${new Date(currentUser.suspendedUntil).toLocaleDateString()}.`
          });
        }
      }

      // 3. Dacă totul e ok, încărcăm evenimentele
      await fetchMyEvents();

    } catch (e) {
      console.error("Eroare la verificarea statusului:", e);
      // În caz de eroare la verificarea ban-ului, încercăm totuși să aducem evenimentele
      fetchMyEvents(); 
    }
  };

  checkStatusAndFetch();
}, [fetchMyEvents, navigate]);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
  };

  // Funcție pentru a deschide formularul în mod EDITARE
  const handleEditClick = (event) => {
    setCurrentEventId(event.id);
    setIsEditing(true);
    setIsCreating(true); // Deschide vizualizarea formularului

    // Formatăm datele pentru input-ul datetime-local (YYYY-MM-DDTHH:mm)
    const formatDateTime = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toISOString().slice(0, 16);
    };

    setFormData({
      title: event.title,
      description: event.description || '',
      location: event.location,
      category: event.category || 'ACADEMIC',
      maxCapacity: event.maxCapacity || '100',
      startTime: formatDateTime(event.startTime),
      endTime: formatDateTime(event.endTime),
      imageUrl: event.imageUrl || ''
    });
  };
  const handleMaterialSelect = (e) => {
    const files = Array.from(e.target.files);
    // Adăugăm fișierele noi la cele pe care le avem deja în listă
    setSelectedMaterials(prevMaterials => [...prevMaterials, ...files]);
    
    // Resetăm input-ul pentru a permite selectarea aceluiași fișier dacă este șters și adăugat iar
    e.target.value = null; 
};

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setCurrentEventId(null);
    setFormData({
      title: '', description: '', location: '', 
      startTime: '', endTime: '', 
      maxCapacity: '100', imageUrl: '', category: 'ACADEMIC'
    });
    setSelectedMaterials([]);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    try {
      setUploadingImage(true);
      const response = await api.post('/images/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(prev => ({ ...prev, imageUrl: response.data.url }));
      toast.success("Imagine încărcată!");
    } catch (error) { toast.error('Eroare upload.'); } 
    finally { setUploadingImage(false); }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const eventPayload = {
      ...formData,
      startTime: formData.startTime.length === 16 ? formData.startTime + ":00" : formData.startTime,
      endTime: formData.endTime.length === 16 ? formData.endTime + ":00" : formData.endTime,
    };

    try {
      if (isEditing) {
        // LOGICA DE UPDATE
        await api.put(`/events/${currentEventId}`, eventPayload);
        
        // Dacă avem materiale noi de adăugat în timpul editării
        if (selectedMaterials.length > 0) {
            const matData = new FormData();
            selectedMaterials.forEach(file => matData.append('files', file));
            await api.post(`/materials/event/${currentEventId}`, matData);
        }
        
        toast.success('Eveniment actualizat cu succes!');
      } else {
        // LOGICA DE CREARE (Multipart)
        const submissionData = new FormData();
        submissionData.append('event', JSON.stringify(eventPayload));
        selectedMaterials.forEach(file => submissionData.append('files', file));

        await api.post('/events', submissionData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Eveniment trimis spre aprobare!');
      }

      handleCancel(); // Reset state și închidere formular
      fetchMyEvents();
    } catch (error) { 
        console.error(error);
        toast.error(isEditing ? 'Eroare la actualizare.' : 'Eroare la creare.'); 
    }
  };

  const handleDeleteEvent = async (id) => {
    if(window.confirm("Sigur vrei să ștergi acest eveniment?")) {
        try {
            await api.delete(`/events/${id}`);
            fetchMyEvents();
            toast.success("Eveniment șters.");
        } catch(e) { toast.error("Eroare la ștergere."); }
    }
  };

  return (
    <div className="org-dashboard">
      {!isCreating ? (
        /* --- VIZUALIZARE LISTA --- */
        <div className="org-list-view">
          <div className="view-header">
            <div className="header-text">
                <h1>Evenimentele Mele</h1>
                <p>Gestionează și monitorizează activitatea experiențelor create de tine.</p>
            </div>
            <button className="create-main-btn" onClick={() => setIsCreating(true)}>
              <Plus size={20} /> CREEAZĂ EVENIMENT
            </button>
          </div>

          {/* ... Secțiunea Stats rămâne la fel ... */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-bg blue"><LayoutDashboard size={20}/></div>
              <label>TOTAL</label>
              <strong>{myEvents.length}</strong>
            </div>
            <div className="stat-card">
              <div className="stat-icon-bg green"><CheckCircle size={20}/></div>
              <label>PUBLICATE</label>
              <strong>{myEvents.filter(e => e.status === 'PUBLISHED').length}</strong>
            </div>
            <div className="stat-card">
              <div className="stat-icon-bg orange"><Hourglass size={20}/></div>
              <label>PENDING</label>
              <strong>{myEvents.filter(e => e.status === 'PENDING').length}</strong>
            </div>
            <div className="stat-card">
              <div className="stat-icon-bg red"><AlertCircle size={20}/></div>
              <label>RESPINSE</label>
              <strong>{myEvents.filter(e => e.status === 'REJECTED').length}</strong>
            </div>
            <div className="stat-card">
              <div className="stat-icon-bg purple"><Users size={20}/></div>
              <label>PARTICIPANȚI</label>
              <strong>{myEvents.reduce((acc, curr) => acc + (curr.participantCount || 0), 0)}</strong>
            </div>
            <div className="stat-card">
          <div className="stat-icon-bg yellow"><Star size={20}/></div>
          <label>RATING MEDIU</label>
          <strong style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            {globalRating}
            {globalRating !== "N/A" && <Star size={18} fill="#eab308" color="#eab308" style={{ marginBottom: '2px' }}/>}
          </strong>
        </div>
          </div>

          <div className="search-row" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)',borderRadius:'20px'}}>
            <div className="search-bar" style={{border:'none'}}>
                <Search size={25} color="#e49750"/>
                <input type="text" placeholder="Caută în evenimentele tale..." style={{padding:'10px', background:'none', fontSize:'20px'}}/>
            </div>
          </div>

          <div className="org-cards-container">
            {myEvents.map(event => (
              <div key={event.id} className="organizer-event-card">
                <div className="card-image-box">
                  <img src={event.imageUrl || '/default.jpg'} alt="" />
                  <div className="card-top-badges">
                    <span className={`status-pill ${event.status}`}>● {event.status === 'PUBLISHED' ? 'PUBLICAT' : 'PENDING'}</span>
                    <span className="category-pill">{event.category}</span>
                  </div>
                </div>
                <div className="card-body">
                  <h2 className="card-title">{event.title}</h2>
                  <div className="card-meta">
                    <span><Calendar size={16}/> {new Date(event.startTime).toLocaleDateString('ro-RO', {day:'numeric', month:'long', year:'numeric'})}</span>
                    <span><Clock size={16}/> {new Date(event.startTime).toLocaleTimeString('ro-RO', {hour:'2-digit', minute:'2-digit'})}</span>
                    <span><MapPin size={16}/> {event.location}</span>
                  </div>
                  
                  {/* ... Metrics Row ... */}
                  <div className="card-metrics-row">
                    <div className="metric-item">
                        <label>OCUPARE</label>
                        <div className="metric-val">{event.participantCount || 0} / {event.maxCapacity}</div>
                        <div className="mini-progress-bg"><div className="mini-progress-fill" style={{width: `${(event.participantCount/event.maxCapacity)*100}%`}}></div></div>
                    </div>
                    <div className="metric-divider"></div>
                    <div className="metric-item">
                        <label>RATING</label>
                        <div className="metric-val rating-val"><Star size={16} fill="#eab308" color="#eab308"/> {event.averageRating?.toFixed(1) || 'N/A'} <span>({event.reviewCount || 0})</span></div>
                    </div>
                  </div>

                  <div className="card-action-btns">
                    <button className="btn-action participants" onClick={() => setSelectedEventForParticipants(event)}>
                      <Users size={16}/> PARTICIPANȚI
                    </button>
                    <button className="btn-action reviews" onClick={() => setSelectedEventForReviews(event)}>
                      <MessageSquare size={16}/> RECENZII
                    </button>
                  </div>
                  

                  <div className="card-footer-btns">
                    {/* TRIGGER EDITARE LOCALĂ */}
                    <button className="btn-edit-main" onClick={() => handleEditClick(event)}>
                      <Pencil size={16}/> Editează
                    </button>
                    <button className="btn-delete-icon" onClick={() => handleDeleteEvent(event.id)}>
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              </div>
              
            ))}
          </div>
          {selectedEventForParticipants && (
      <ParticipantsModal 
        event={selectedEventForParticipants} 
        onClose={() => setSelectedEventForParticipants(null)} 
      />
    )}

    {selectedEventForReviews && (
      <ReviewsModal 
        event={selectedEventForReviews} 
        onClose={() => setSelectedEventForReviews(null)} 
      />
    )}

        </div>
        
      ) : (
        /* --- VIZUALIZARE FORMULAR (CREARE SAU EDITARE) --- */
        <div className="create-view">
            <div className="create-hero">
              <button className="back-link-btn" onClick={handleCancel} style={{marginTop:'10px', background:'none', border:'none', color:'gray', cursor:'pointer'}}>
                  ← Anulează și revino la listă
                </button>
                <h1>{isEditing ? 'Editează' : 'Creează un'} <span>Eveniment {isEditing ? '' : 'Nou'}</span></h1>
                <p style={{ fontSize:'20px'}}>{isEditing ? 'Actualizează detaliile și conținutul experienței tale.' : 'Împărtășește experiențe și oportunități cu întreaga comunitate.'}</p>
                
            </div>

            <div className="create-layout">
                <div className="form-sections">
                    <form onSubmit={handleFormSubmit}>
                        <div className="form-block">
                            <div className="block-header">
                                <div className="block-icon blue"><Type size={18}/></div>
                                <h3 style={{color:'black'}}>Informații Generale</h3>
                            </div>
                            <div className="field-group">
                                <label >TITLU EVENIMENT</label>
                                <input  style={{color:'black'}} name="title" value={formData.title} onChange={handleCreateChange} placeholder="Ex: Workshop Design Thinking" required />
                            </div>
                            <div className="field-row">
                                <div className="field-group">
                                    <label>CATEGORIE</label>
                                    <select name="category" value={formData.category} onChange={handleCreateChange} style={{color:'black'}}>
                                        <option value="ACADEMIC">Academic</option>
                                        <option value="SOCIAL">Social</option>
                                        <option value="CAREER">Carieră</option>
                                        <option value="SPORT">Sport</option>
                                        <option value="VOLUNTEERING">Voluntariat</option>
                                    </select>
                                </div>
                                <div className="field-group">
                                    <label>LOCAȚIE</label>
                                    <input style={{color:'black'}} name="location" value={formData.location} onChange={handleCreateChange} placeholder="Ex: Aula Corp A" />
                                </div>
                            </div>
                            <div className="field-group">
                                <label>DESCRIERE DETALIATĂ</label>
                                <textarea  style={{color:'black'}} name="description" value={formData.description} onChange={handleCreateChange} placeholder="Povestește-ne mai multe..." rows="5" />
                            </div>
                        </div>

                        <div className="form-block">
                            <div className="block-header">
                                <div className="block-icon orange"><Clock size={18}/></div>
                                <h3 style={{color:'black'}}>Logistică & Acces</h3>
                            </div>
                            <div className="field-row">
                                <div className="field-group" >
                                    <label>DATA ȘI ORA START</label>
                                    <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleCreateChange} style={{color:'black'}}/>
                                </div>
                                <div className="field-group">
                                    <label>DATA ȘI ORA FINAL</label>
                                    <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleCreateChange} style={{color:'black'}}/>
                                </div>
                            </div>
                            <div className="field-group">
                                <label>CAPACITATE MAXIMĂ LOCURI</label>
                                <input type="number" name="maxCapacity" value={formData.maxCapacity} onChange={handleCreateChange} style={{color:'black'}}/>
                            </div>
                        </div>

                                          <div className="form-block">
                        <div className="block-header">
                            <div className="block-icon red"><ImageIcon size={18}/></div>
                            <h3 style={{color:'black'}}>Media și Documente</h3>
                        </div>

                      <label className="input-sub-label" style={{ color: 'black' }}>IMAGINE DE COPERTĂ</label>
                      <div className="image-dropzone" style={{backgroundColor:'#da93933d',padding:'80px'}}>
                          {formData.imageUrl ? (
                              <div className="img-up-preview">
                                  <img src={formData.imageUrl} alt="Preview" />
                                  <button type="button" onClick={() => setFormData({ ...formData, imageUrl: '' })} style={{color:"red", backgroundColor:'#eec5c544', border:'1px solid #949393', width:'50%', padding:'5px', margin:'10px'}}>
                                      Sterge imaginea
                                  </button>
                              </div>
                          ) : (
                              <div className="drop-placeholder">
                                  <div className="up-icon-circle"><Upload size={26} color="#3b82f6" /></div>
                                  <p>Alege o imagine</p>
                                  <span>Recomandat: 16:9, max 5MB</span>
                                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                              </div>
                          )}
                      </div>

                        <label className="input-sub-label" style={{color:'black'}}>MATERIALE SUPORT (PDF, DOCX)</label>
                        
                        <div className="file-input-custom">
                            <label className="choose-btn">
                                Choose Files
                                <input 
                                    type="file" 
                                    multiple 
                                    onChange={handleMaterialSelect} 
                                />
                            </label>
                            <span className="file-count">
                                {selectedMaterials.length} fișiere pregătite pentru încărcare
                            </span>
                        </div>

                        {/* LISTA DE FIȘIERE SELECTATE */}
                        {selectedMaterials.length > 0 && (
                            <div className="materials-preview-list" style={{ marginTop: '15px' }}>
                                {selectedMaterials.map((file, index) => (
                                    <div key={index} className="file-preview-item" style={{
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        background: '#f8fafc', 
                                        padding: '10px', 
                                        borderRadius: '10px',
                                        marginBottom: '8px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <span style={{ fontSize: '14px', color: '#1e293b' }}>{file.name}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => setSelectedMaterials(prev => prev.filter((_, i) => i !== index))}
                                            style={{ background: 'none', border: 'none', color: '#ff5959', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Elimină
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                        <button type="submit" className="btn-publish-final">
                            {isEditing ? 'SALVEAZĂ MODIFICĂRILE' : 'PUBLICĂ EVENIMENTUL'} <ArrowRight size={20}/>
                        </button>
                    </form>
                </div>

                {/* LIVE PREVIEW RĂMÂNE FUNCȚIONAL */}
                <div className="preview-sticky-col">
                    <div className="preview-tag"><ImageIcon size={14}/> LIVE PREVIEW</div>
                    <div className="preview-card-mock">
                        <div className="mock-img">
                            {formData.imageUrl ? <img src={formData.imageUrl} alt=""/> : <div className="no-img"><ImageIcon size={40}/><p>NICIO IMAGINE</p></div>}
                            <div className="mock-badge-cat">{formData.category}</div>
                        </div>
                        <div className="mock-content">
                            <h2 style={{color:'black'}}>{formData.title || "Titlul Evenimentului"}</h2>
                            <p className="mock-desc">{formData.description || "Descrierea ta va apărea aici..."}</p>
                            <div className="mock-details">
                               <span>
                                  <Calendar size={14} />
                                  {" "}
                                  {formData.startTime
                                    ? new Date(formData.startTime).toLocaleDateString("ro-RO")
                                    : new Date().toLocaleDateString("ro-RO")}
                                </span>
                                <span><TimerIcon size={14}/> {formData.location || "--:----:--"}</span>
                                <span><MapPin size={14}/> {formData.location || "Locația evenimentului"}</span>
                                <span></span>
                                <span></span>
                                 {/* LIVE PREVIEW - SECȚIUNEA LOCURI */}
                                <div className="mock-footer">
                                  <div className="mock-locuri-header">
                                    <div className="mock-locuri-label">
                                      
                                      <Users size={14} /> <span>LOCURI</span>
                                      
                                    </div>
                                  
                                  </div>
                                  
                                 
                                  <div className="mock-progress-container">
                                      
                                    <div 
                                      className="mock-progress-fill" 
                                      style={{ width: '0%' }} // Fiind un eveniment nou, ocuparea este 0%
                                      
                                    ></div>
                                    <span className="blue-count">0 / {formData.maxCapacity || 0}</span>
                                  </div>
                                </div>
                            </div>
                            
                        </div>
                        
                    </div>
                    <div style={{border:'1px solid #a8d5f3', borderRadius:'10px', padding:'10px', background:'#e7eef1', margin:'10px'}}>
                              <p style={{color:'blue', lineHeight:'0.05px'}}>Sfat pentru organizatori</p>
                    <p style={{color:'#538fdf'}}>Folosește o imagine de înaltă calitate (16:9) și un titlu scurt, dar descriptiv (sub 50 de caractere) pentru a atrage mai mulți studenți.</p>
                              </div>
                </div>
                
            </div>
            
        </div>
      )}

      {/* Modals */}
      {selectedEventForParticipants && (
        <ParticipantsModal event={selectedEventForParticipants} onClose={() => setSelectedEventForParticipants(null)} />
      )}
      {selectedEventForReviews && (
        <ReviewsModal event={selectedEventForReviews} onClose={() => setSelectedEventForReviews(null)} />
      )}
    </div>
  );
};

export default OrganizerDashboard;