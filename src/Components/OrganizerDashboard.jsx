import React, { useState, useCallback, useEffect } from 'react';
import EventCard from './EventCard';
import api from '../services/api'; 
import './OrganizerDashboard.css';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; 


const UploadIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(true);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);



  const [restriction, setRestriction] = useState({ isRestricted: false, msg: "" });

  const [selectedMaterials, setSelectedMaterials] = useState([]);


 


  const [formData, setFormData] = useState({
    title: '', description: '', location: '', 
    startTime: '', endTime: '', 
    maxCapacity: '', imageUrl: '', category: 'SOCIAL'
  });

  
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '', description: '', location: '', startTime: '',
    endTime: '', maxCapacity: '', imageUrl: '', category: 'SOCIAL', materials:[]
  });
const checkStatus = useCallback(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      const now = new Date();
      
      let restricted = false;
      let message = "";

      if (parsedUser.isEnabled === false) {
        restricted = true;
        message = "CONT BLOCAT (BAN). Nu poți crea sau edita evenimente.";
      } else if (parsedUser.suspendedUntil && new Date(parsedUser.suspendedUntil) > now) {
        restricted = true;
        message = `CONT SUSPENDAT până la ${new Date(parsedUser.suspendedUntil).toLocaleDateString()}.`;
      }

      setRestriction({ isRestricted: restricted, msg: message });
      return restricted;
    }
    return false;
  }, []);
  const fetchMyEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/events/my-events'); 
      setMyEvents(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Eroare la incarcarea evenimentelor.");
    } finally {
      setLoading(false);
    }
  }, []);



useEffect(() => {
  const checkStatusAndFetch = async () => {
    const userData = localStorage.getItem('user');
    if (!userData) return navigate('/');

    try {
  
      const userObj = JSON.parse(userData);
      const res = await api.get(`/admin/users`); 
      const currentUser = res.data.find(u => u.id === userObj.id);

      if (currentUser) {
        const now = new Date();
        const isBanned = currentUser.isEnabled === false;
        const isSuspended = currentUser.suspendedUntil && new Date(currentUser.suspendedUntil) > now;

        if (isBanned || isSuspended) {
          setRestriction({
            isRestricted: true,
            msg: isBanned ? "Contul tău este BLOCAT (BAN)." : "Activitatea ta este SUSPENDATĂ."
          });
        }
      }
      fetchMyEvents();
    } catch (e) {
      fetchMyEvents(); 
    }
  };

  checkStatusAndFetch();
}, [fetchMyEvents, navigate]);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Esti sigur ca vrei sa stergi acest eveniment?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      setMyEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      toast.success('Eveniment sters cu succes!');
    } catch (error) {
      console.error(error);
      toast.error('A aparut o eroare la stergere.');
    }
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  
  const handleImageUpload = async (e, isEditMode = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; 
    if (file.size > maxSize) {
        toast.error('Imaginea este prea mare! (< 10MB)');
        e.target.value = null; 
        return;
    }

    const data = new FormData();
    data.append("file", file);

    try {
      setUploadingImage(true);
      const response = await api.post('/images/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = response.data.url;
      
      if (isEditMode) {
        setEditFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
      } else {
        setFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
      }
      toast.success("Imagine încărcată!");
    } catch (error) {
      console.error(error);
      toast.error('Nu am putut incarca imaginea.');
    } finally {
      setUploadingImage(false);
    }
  };
  const handleDeleteImage = async (isEdit = false) => {
    const urlToDelete = isEdit ? editFormData.imageUrl : formData.imageUrl;
    if (!urlToDelete) return;

    try {
  
      await api.delete(`/images/delete?url=${encodeURIComponent(urlToDelete)}`);
      
      if (isEdit) {
        setEditFormData(prev => ({ ...prev, imageUrl: '' }));
      } else {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
      }
      toast.success("Imaginea a fost ștearsă de pe server.");
    } catch (error) {
      console.error(error);
      toast.error("Eroare la ștergerea imaginii.");
    }
  };
  const handleDeleteSavedMaterial = async (materialId) => {
    if (!window.confirm("Ștergi definitiv acest fișier atașat?")) return;
    try {
    
      await api.delete(`/api/materials/${materialId}`);
      
      
      setEditFormData(prev => ({
        ...prev,
        materials: prev.materials.filter(m => m.id !== materialId)
      }));
      toast.success("Fișier șters!");
    } catch (error) {
      toast.error("Nu s-a putut șterge fișierul.");
    }
  };


  const handleMaterialSelect = (e) => {
      const files = Array.from(e.target.files);
      setSelectedMaterials(prev => [...prev, ...files]);
  };

  const removeMaterial = (index) => {
      setSelectedMaterials(prev => prev.filter((_, i) => i !== index));
  };

  
  const uploadMaterialsToServer = async (eventId, files) => {
      if (files.length === 0) return;
      
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));

      try {
          await api.post(`/materials/event/${eventId}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          toast.success("Materiale adăugate!");
      } catch (error) {
          console.error("Eroare upload materiale:", error);
          toast.error("Eroare la adăugarea materialelor.");
      }
  };


  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.startTime || !formData.endTime) {
       toast.error('Titlul si datele sunt obligatorii!');
       return;
    }

    let safeCapacity = null;
    if (formData.maxCapacity !== '' && formData.maxCapacity !== null) {
        const parsed = parseInt(formData.maxCapacity, 10);
        if (!isNaN(parsed)) safeCapacity = parsed;
    }

    try {
      
      const eventPayload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startTime: formData.startTime.length === 16 ? formData.startTime + ":00" : formData.startTime,
        endTime: formData.endTime.length === 16 ? formData.endTime + ":00" : formData.endTime,
        maxCapacity: safeCapacity,
        imageUrl: formData.imageUrl, 
        category: formData.category
      };

      
      const submissionData = new FormData();
      
    
      submissionData.append('event', JSON.stringify(eventPayload));

    
      if (selectedMaterials.length > 0) {
          selectedMaterials.forEach(file => {
              submissionData.append('files', file);
          });
      }

      console.log("Se trimite Multipart Request...");

      await api.post('/events', submissionData, {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
      });

     
      setFormData({
        title: '', description: '', location: '', startTime: '',
        endTime: '', maxCapacity: '', imageUrl: '', category: 'SOCIAL'
      });
      setSelectedMaterials([]);
      setShowForm(false);
      await fetchMyEvents();
      toast.success('Eveniment creat cu succes!');

    } catch (error) {
      console.error("Eroare creare:", error);
      const errMsg = error.response?.data?.message || error.response?.data || error.message || 'Eroare necunoscută';
      toast.error(`Eroare: ${errMsg}`);
    }
  };

  
  const handleUpdateSubmit = async (e) => {
      e.preventDefault();
      
      let safeCapacity = null;
      if (editFormData.maxCapacity !== '' && editFormData.maxCapacity !== null) {
          const parsed = parseInt(editFormData.maxCapacity, 10);
          if (!isNaN(parsed)) safeCapacity = parsed;
      }

      try {
          const payload = {
            ...editFormData,
            startTime: editFormData.startTime.length === 16 ? editFormData.startTime + ":00" : editFormData.startTime,
            endTime: editFormData.endTime.length === 16 ? editFormData.endTime + ":00" : editFormData.endTime,
            maxCapacity: safeCapacity,
          };

          await api.put(`/events/${currentEventId}`, payload);
          
         
          if (selectedMaterials.length > 0) {
              await uploadMaterialsToServer(currentEventId, selectedMaterials);
              setSelectedMaterials([]); 
          }
          
          setMyEvents(prev => prev.map(ev => 
            ev.id === currentEventId ? { ...ev, ...payload, id: currentEventId } : ev
          ));

          toast.success("Eveniment actualizat!");
          setIsEditing(false);
      } catch (error) {
          console.error("Eroare actualizare:", error);
          const errMsg = error.response?.data?.message || error.message || "Eroare la actualizare";
          toast.error(errMsg);
      }
  };

  const openEditModal = (event) => {
    setCurrentEventId(event.id);
    const formatForInput = (dateString) => {
        if(!dateString) return '';
        return new Date(dateString).toISOString().slice(0, 16);
    };

    setEditFormData({
        title: event.title,
        description: event.description || '',
        location: event.location,
        category: event.category || 'SOCIAL',
        maxCapacity: (event.maxCapacity !== null && event.maxCapacity !== undefined) ? event.maxCapacity : '',
        startTime: formatForInput(event.startTime),
        endTime: formatForInput(event.endTime),
        imageUrl: event.imageUrl || ''
    });
    setSelectedMaterials([]); 
    setIsEditing(true);
  };

 return (
    <div className="organizer-container">
      <div className="top-nav-header">
        <button className="back-arrow-btn" onClick={() => navigate(-1)}>←</button>
      </div>

      <div className="content-wrapper">
        {restriction.isRestricted ? (
          <div className="info-box-red" style={{ textAlign: 'center', padding: '50px', margin: '20px', background: '#ffe5e5', borderRadius: '15px', color: '#b30000' }}>
            <FaBan size={50} />
            <h2>Acces Restricționat</h2>
            <p>{restriction.msg}</p>
          </div>
        ) : (
          <>
            <div className="page-header-simple">
              <h1>Crează eveniment nou</h1>
              <p>Completează detaliile pentru a crea evenimentul tău</p>
            </div>

            <div className="controls-section">
              <form className="event-form-clean" onSubmit={handleCreateSubmit}>
                <div className="form-group">
                  <label>Titlu eveniment *</label>
                  <input type="text" name="title" placeholder="Introdu titlul evenimentului" value={formData.title} onChange={handleCreateChange} required style={{ border: "1px solid black" }} />
                </div>

                <div className="form-group">
                  <label>Descriere *</label>
                  <textarea name="description" rows="4" placeholder="Descriere detaliată a evenimentului" value={formData.description} onChange={handleCreateChange} style={{ border: "1px solid black" }} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Facultate / Categorie *</label>
                    <select name="category" value={formData.category} onChange={handleCreateChange} style={{ border: "1px solid black" }}>
                      <option value="SOCIAL">Social</option>
                      <option value="ACADEMIC">Academic</option>
                      <option value="CAREER">Career</option>
                      <option value="SPORT">Sport</option>
                      <option value="VOLUNTEERING">Volunteering</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Capacitate (Locuri) *</label>
                    <input type="number" name="maxCapacity" placeholder="Ex: 100" value={formData.maxCapacity} onChange={handleCreateChange} min="1" style={{ border: "1px solid black" }} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Locație *</label>
                  <input type="text" name="location" placeholder="Introdu locația evenimentului" value={formData.location} onChange={handleCreateChange} required style={{ border: "1px solid black" }} />
                </div>

                <div className="form-row">
                  <div className="form-group"><label>Start *</label><input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleCreateChange} required style={{ border: "1px solid black" }} /></div>
                  <div className="form-group"><label>End *</label><input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleCreateChange} required style={{ border: "1px solid black" }} /></div>
                </div>

                <div className="form-group" style={{ marginTop: '20px', color: "black" }}>
                  <label style={{ fontSize: "14px" }}>Imagine Principală</label>
                  
                  {!formData.imageUrl ? (
                    <div className="custom-dropzone" style={{ position: 'relative' }}>
                      <div className="upload-icon-large"><UploadIcon /></div>
                      <p className="upload-text">
                        {uploadingImage ? 'Se încarcă...' : (
                          <><span>Click pentru a încărca</span> sau trage imaginea aici</>
                        )}
                      </p>
                      <p className="upload-hint">PNG, JPG până la 10MB</p>
                      <input
                        type="file"
                        className="file-input-hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 100, display: 'block' }}
                      />
                    </div>
                  ) : (
                    <div className="preview-container" style={{ position: 'relative', width: 'fit-content' }}>
                      <div className="img-preview-box">
                        <img src={formData.imageUrl} alt="Preview" style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid #ccc' }} />
                        <button 
                          type="button" 
                          onClick={() => handleDeleteImage(false)} 
                          style={{ position: 'absolute', top: '0px', right: '0px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', padding: '0', lineHeight: '0' }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <h4 className="materials-title" style={{ fontSize: "14px", fontWeight: "500" }}>Materiale și Atașamente</h4>
                <div className="materials-section">
                  <div className="custom-dropzone" style={{ borderStyle: 'dotted', minHeight: '80px', position: 'relative' }}>
                    <div className="upload-icon-large" style={{ fontSize: '24px' }}>📎</div>
                    <p className="upload-text"><span>Adaugă fișiere</span> (PDF, Imagini, Docx)</p>
                    <input
                      type="file"
                      className="file-input-hidden"
                      multiple
                      onChange={handleMaterialSelect}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 100, display: 'block' }}
                    />
                  </div>

                  {selectedMaterials.length > 0 && (
                    <div className="preview-container">
                      {selectedMaterials.map((file, idx) => (
                        <div key={idx} className="file-preview-item">
                          <span>{file.name}</span>
                          <button type="button" className="remove-file-btn" onClick={() => removeMaterial(idx)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="info-box-green" style={{ marginTop: '20px', fontWeight: "500", fontSize: "20px", border: "2px solid #aceed8ff" }}>
                  Evenimentul va fi trimis spre aprobare. Materialele vor fi încărcate automat.
                </div>

                <div className="form-actions-row">
                  <button 
                    type="button" 
                    className="btn-cancel" 
                    onClick={() => {
                      setFormData({ title: '', description: '', location: '', startTime: '', endTime: '', maxCapacity: '', imageUrl: '', category: 'SOCIAL' });
                      setSelectedMaterials([]);
                      toast.success("Câmpurile au fost resetate");
                    }} 
                    disabled={uploadingImage}
                  >
                    Anulează
                  </button>
                  <button type="submit" className="btn-submit" disabled={uploadingImage}>{uploadingImage ? 'Se procesează...' : 'Trimite Evenimentul'}</button>
                </div>
              </form>
            </div>
          </>
        )}

        <hr className="divider" />

        <div className="my-events-section">
          <h2>Evenimentele Mele</h2>
          {loading ? <p>Se incarca...</p> : (
            <div className="events-grid">
              {myEvents.length > 0 ? (
                myEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    date={event.startTime}
                    location={event.location}
                    description={event.description}
                    imageUrl={event.imageUrl}
                    category={event.category}
                    maxCapacity={event.maxCapacity}
                    onDelete={() => handleDeleteEvent(event.id)}
                    onEdit={() => openEditModal(event)}
                  />
                ))
              ) : (
                <p style={{ color: '#888' }}>Nu ai creat niciun eveniment inca.</p>
              )}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="modal-overlay">
            <div className="modal-content-clean">
              <h3>Editează Eveniment</h3>
              <form onSubmit={handleUpdateSubmit} className="edit-form-clean">
                <div className="form-group"><label>Titlu</label><input type="text" name="title" value={editFormData.title} onChange={handleEditChange} required /></div>
                <div className="form-row">
                  <div className="form-group"><label>Categorie</label><select name="category" value={editFormData.category} onChange={handleEditChange}><option value="SOCIAL">Social</option><option value="VOLUNTEERING">Volunteering</option><option value="CAREER">Carrer</option><option value="ACADEMIC">Academic</option><option value="SPORT">Sport</option></select></div>
                  <div className="form-group"><label>Capacitate</label><input type="number" name="maxCapacity" value={editFormData.maxCapacity} onChange={handleEditChange} /></div>
                </div>
                <div className="form-group"><label>Locație</label><input type="text" name="location" value={editFormData.location} onChange={handleEditChange} required /></div>
                <div className="form-row">
                  <div className="form-group"><label>Start</label><input type="datetime-local" name="startTime" value={editFormData.startTime} onChange={handleEditChange} required /></div>
                  <div className="form-group"><label>End</label><input type="datetime-local" name="endTime" value={editFormData.endTime} onChange={handleEditChange} required /></div>
                </div>
                <div className="form-group"><label>Descriere</label><textarea name="description" rows="3" value={editFormData.description} onChange={handleEditChange} /></div>

                <div className="form-group">
                  <label>Imagine Eveniment</label>
                  {!editFormData.imageUrl ? (
                    <div className="custom-dropzone" style={{ padding: '15px', position: 'relative' }}>
                      <div className="upload-text">Click sau Drag & Drop</div>
                      <input
                        type="file"
                        className="file-input-hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 100, display: 'block' }}
                      />
                    </div>
                  ) : (
                    <div className="preview-container" style={{ position: 'relative', width: 'fit-content' }}>
                      <div className="img-preview-box">
                        <img src={editFormData.imageUrl} alt="Preview" style={{ maxWidth: '150px', borderRadius: '8px' }} />
                        <button 
                          type="button" 
                          onClick={() => handleDeleteImage(true)}
                          style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '25px', height: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="materials-section">
                  <h4 className="materials-title">Adaugă Materiale Noi</h4>
                  <div className="custom-dropzone" style={{ padding: '15px', borderStyle: 'dotted', marginBottom: "20px", position: 'relative' }}>
                    <div className="upload-text">📎 Adaugă fișiere</div>
                    <input
                      type="file"
                      className="file-input-hidden"
                      multiple
                      onChange={handleMaterialSelect}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 100, display: 'block' }}
                    />
                  </div>
                  {selectedMaterials.length > 0 && (
                    <div className="preview-container">
                      {selectedMaterials.map((file, idx) => (
                        <div style={{marginBottom:'15px'}} key={idx} className="file-preview-item"><span>{file.name}</span><button type="button" className="remove-file-btn" onClick={() => removeMaterial(idx)}>×</button></div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-actions-row">
                  <button 
                    type="button" 
                    className="btn-cancel" 
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedMaterials([]);
                      setEditFormData({ title: '', description: '', location: '', startTime: '', endTime: '', maxCapacity: '', imageUrl: '', category: 'SOCIAL' });
                    }}
                  >
                    Anulează
                  </button>                  
                  <button type="submit" className="btn-submit">Salvează</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;