import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Settings.css';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, User, Lock, Save, Loader2, 
  Phone, KeyRound, University, Mail, Timer, 
  Briefcase, Shield, CheckCircle2
} from 'lucide-react';
import { CgOrganisation } from 'react-icons/cg';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'organizer'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '', lastName: '', phoneNumber: '',
    email: '', role: '', faculty: '', organizationName: '', studentYear: '',
    pendingUpgradeRequest: false
  });

  const [passData, setPassData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  const [orgRequest, setOrgRequest] = useState({
    organizationName: '', reason: ''
  });

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setProfileData(response.data);
    } catch (error) {
      toast.error("Nu s-au putut încărca datele.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
  const handlePassChange = (e) => setPassData({ ...passData, [e.target.name]: e.target.value });
  const handleOrgRequestChange = (e) => setOrgRequest({ ...orgRequest, [e.target.name]: e.target.value });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/user/profile', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber
      });
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        storedUser.firstName = profileData.firstName;
        storedUser.lastName = profileData.lastName;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }
      toast.success("Profil salvat!");
    } catch (error) {
      toast.error("Eroare la salvare.");
    } finally { setSaving(false); }
  };

  const handleUpdatePassword = async () => {
    if (passData.newPassword !== passData.confirmPassword) return toast.error("Parolele nu coincid!");
    setSaving(true);
    try {
      await api.put('/user/password', {
        oldPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success("Parolă actualizată!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Eroare parolă.");
    } finally { setSaving(false); }
  };

  const handleSendOrgRequest = async () => {
    setRequesting(true);
    try {
      await api.post('/user/request-organizer', orgRequest);
      toast.success("Cerere trimisă!");
      fetchProfile();
    } catch (error) { toast.error("Eroare la trimitere."); }
    finally { setRequesting(false); }
  };

  if (loading) return <div className="settings-loading"><Loader2 className="animate-spin" /> Se încarcă...</div>;

  return (
    <div className="settings-page-wrapper">
      <div className="settings-container">
        
        <header className="settings-header" >
          <div className="header-titles">
            <h1>Setări Cont</h1>
            <p>Gestionează-ți profilul, securitatea și preferințele.</p>
          </div>
        </header>

        <div className="settings-layout">
          {/* SIDEBAR NAV */}
          <aside className="settings-sidebar" >
            <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <div className="nav-icon-box orange"><User size={20} /></div>
              <div className="nav-text">
                <strong>Profilul Meu</strong>
                <span>DATE PERSONALE</span>
              </div>
            </button>

            <button className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <div className="nav-icon-box red"><Lock size={20} /></div>
              <div className="nav-text">
                <strong>Securitate</strong>
                <span>PAROLĂ & ACCES</span>
              </div>
            </button>

            <button className={`nav-item ${activeTab === 'organizer' ? 'active' : ''}`} onClick={() => setActiveTab('organizer')}>
              <div className="nav-icon-box blue"><Briefcase size={20} /></div>
              <div className="nav-text">
                <strong>Organizator</strong>
                <span>STATUS & CERERI</span>
              </div>
            </button>
          </aside>

          {/* MAIN CONTENT PANELS */}
          <main className="settings-main-content">
            
            {activeTab === 'profile' && (
              <div className="content-card" >
                <div className="identity-header" style={{border:'1px solid #adadad55', padding:'10px', borderRadius:'30px', lineHeight:'15px', backgroundColor:'#d5d5d54f'}}>
                  <div className="avatar-large" style={{marginLeft:'20px'}}>{profileData.firstName[0]}</div>
                  <div className="identity-info">
                    <h2 style={{color:'black'}}>{profileData.firstName} {profileData.lastName}</h2>
                    <p style={{color:'black'}}>{profileData.email}</p>
                    <span className="role-badge-main" style={{color:'black'}}>{profileData.role}</span>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="input-group">
                    <label>Prenume</label>
                    <input style={{backgroundColor:'white', color:'black'}} type="text" name="firstName" value={profileData.firstName} onChange={handleProfileChange} />
                  </div>
                  <div className="input-group">
                    <label>Nume</label>
                    <input style={{backgroundColor:'white', color:'black'}} type="text" name="lastName" value={profileData.lastName} onChange={handleProfileChange} />
                  </div>
                  <div className="input-group">
                    <label>Telefon</label>
                    <input  style={{backgroundColor:'white', color:'black'}} type="tel" name="phoneNumber" value={profileData.phoneNumber} onChange={handleProfileChange} />
                  </div>
                  <div className="input-group">
                    <label>Email</label>
                    <input style={{backgroundColor:'white', color:'black'}} type="text" value={profileData.email} disabled className="disabled-input" />
                    <small>Email-ul nu poate fi schimbat.</small>
                  </div>

                  {/* Inputuri specifice Rolului */}
                  {profileData.role === 'STUDENT' && (
                    <>
                      <div className="input-group">
                        <label>Facultate</label>
                        <select style={{backgroundColor:'white', color:'black'}} name="faculty" value={profileData.faculty} onChange={handleProfileChange}>
                          <option value="FIESC">FIESC</option>
                          <option value="FEAA">FEAA</option>
                          
                        </select>
                      </div>
                      <div className="input-group">
                        <label>An de studiu</label>
                        <select style={{backgroundColor:'white', color:'black'}} name="studentYear" value={profileData.studentYear} onChange={handleProfileChange}>
                          <option value="1">Anul 1</option>
                          <option value="2">Anul 2</option>
                          <option value="2">Anul 3</option>
                          <option value="2">Anul 4</option>
                        </select>
                      </div>
                    </>
                  )}

                  {profileData.role === 'ORGANIZER' && (
                    <div className="input-group full-width">
                      <label>Nume Organizație</label>
                      <input style={{backgroundColor:'white', color:'black'}}  type="text" name="organizationName" value={profileData.organizationName} onChange={handleProfileChange} />
                    </div>
                  )}
                </div>
                <button className="btn-primary-salmon" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Salvează Profilul
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="content-card" >
               <div 
  className="panel-intro" 
  style={{ display: 'flex', alignItems: 'center', gap: '20px'}} // Am adăugat gap pentru spațiu între cerc și text
>
  <div 
    className="intro-icon red" 
    style={{
      color: 'white', 
      backgroundColor: '#ff5500', 
      borderRadius: '50%', // Folosește 50% pentru un cerc perfect
      width: '100px', 
      height: '100px', 
      display: 'flex',        // ESENȚIAL: Transformă div-ul în flexbox
      alignItems: 'center',    // Centrează vertical
      justifyContent: 'center',
      marginBottom:"30px" // Centrează orizontal
    }}
  >
    <Shield size={50}/>
  </div>
  
  <div className="intro-text">
    <h3 style={{ color: 'black', margin: 0 }}>Securitate și Parolă</h3>
    <p style={{ color: '#64748b', margin: '5px 0 0' }}>Gestionează accesul la contul tău</p>
  </div>
</div>
                <div className="form-stack">
                  <div className="input-group">
                    <label>Parola Curentă</label>
                    <input style={{backgroundColor:'white', color:'black'}} type="password" name="currentPassword" value={passData.currentPassword} onChange={handlePassChange} />
                  </div>
                  <div className="input-group">
                    <label>Parola Nouă</label>
                    <input style={{backgroundColor:'white', color:'black'}} type="password" name="newPassword" value={passData.newPassword} onChange={handlePassChange} />
                  </div>
                  <div className="input-group">
                    <label>Confirmă Parola Nouă</label>
                    <input style={{backgroundColor:'white', color:'black'}} type="password" name="confirmPassword" value={passData.confirmPassword} onChange={handlePassChange} />
                  </div>
                </div>
                <button className="btn-primary-dark" onClick={handleUpdatePassword}>
                  <Lock size={18}/> Actualizează Parola
                </button>
              </div>
            )}

 {activeTab === 'organizer' && (
  <div className="content-card">
    <div className="panel-intro" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div 
        className="intro-icon" 
        style={{
          color: 'white', 
          // Schimbăm culoarea în funcție de rol: mov pentru Admin, albastru pentru restul
          backgroundColor: profileData.role === 'ADMIN' ? '#7c3aed' : '#423ae3', 
          borderRadius: '50%',
          width: '100px', 
          height: '100px', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {profileData.role === 'ADMIN' ? <Shield size={50}/> : <Briefcase size={50}/>}
      </div>
      
      <div className="intro-text">
        <h3 style={{ color: 'black', margin: 0 }}>
          {profileData.role === 'ADMIN' ? 'Control Administrativ' : 'Cont Organizator'}
        </h3>
        <p style={{ color: '#64748b', margin: '5px 0 0' }}>
          {profileData.role === 'ADMIN' ? 'Privilegii de sistem' : 'Statutul tău în comunitate'}
        </p>
      </div>
    </div>

    {/* LOGICA DE FILTRARE PE ROLURI */}
    {profileData.role === 'ADMIN' ? (
      /* --- VIZUALIZARE PENTRU ADMIN --- */
      <div className="status-admin-box" style={{ marginTop: '25px', padding: '20px', border: '1px solid #7c3aed33', borderRadius: '15px', backgroundColor: '#7c3aed0a' }}>
        <h4 style={{ color: '#7c3aed', marginBottom: '10px' }}>Sunteți Administrator Principal</h4>
        <p style={{ color: 'black' }}>Aveți acces complet la funcțiile de gestionare ale platformei:</p>
        <ul style={{ color: '#475569', marginLeft: '20px', marginTop: '10px', lineHeight: '25px' }}>
          <li>Gestionarea tuturor utilizatorilor și a rolurilor acestora.</li>
          <li>Aprobarea sau respingerea cererilor de noi organizatori.</li>
          <li>Moderarea și ștergerea oricărui eveniment din platformă.</li>
          <li>Vizualizarea statisticilor globale ale aplicației.</li>
        </ul>
        <button 
          className="btn-primary-dark" 
          style={{ marginTop: '20px', backgroundColor: '#7c3aed' }}
          onClick={() => navigate('/admin')}
        >
          Deschide Panoul de Admin
        </button>
      </div>
    ) : profileData.role === 'ORGANIZER' ? (
      /* --- VIZUALIZARE PENTRU ORGANIZATOR --- */
      <div className="status-success-box" style={{ marginTop: '25px' }}>
        <h4 style={{ color: '#10b981' }}>Felicitări!</h4>
        <p style={{ color: 'black' }}>Ești deja organizator activ pentru: <strong>{profileData.organizationName}</strong>.</p>
        <p style={{ color: '#64748b' }}>Poți crea și gestiona evenimente din Dashboard-ul de organizator.</p>
      </div>
    ) : profileData.pendingUpgradeRequest ? (
      /* --- VIZUALIZARE PENTRU CERERE ÎN CURS --- */
      <div className="status-pending-box" style={{ marginTop: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Timer size={20} color="#f59e0b" />
          <p style={{ color: 'black', margin: 0 }}>Cererea ta este în curs de revizuire de către un administrator.</p>
        </div>
      </div>
    ) : (
      /* --- VIZUALIZARE PENTRU STUDENT (FORMULAR) --- */
      <div className="request-form" style={{ marginTop: '25px' }}>
        <div className="info-box" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '8px', color: '#475569' }}>
          Solicită drepturi de organizator pentru a putea publica și gestiona evenimente proprii.
        </div>
        <div className="input-group">
          <label>Nume Organizație</label>
          <input style={{backgroundColor:'white', color:'black'}} type="text" name="organizationName" value={orgRequest.organizationName} onChange={handleOrgRequestChange} placeholder="ex: Liga Studenților FIESC" />
        </div>
        <div className="input-group">
          <label>Motivul solicitării</label>
          <textarea style={{backgroundColor:'white', color:'black', minHeight: '100px'}} name="reason" value={orgRequest.reason} onChange={handleOrgRequestChange} placeholder="Descrie pe scurt ce fel de evenimente dorești să organizezi..." />
        </div>
        <button className="btn-primary-blue" onClick={handleSendOrgRequest} disabled={requesting}>
          {requesting ? <Loader2 className="animate-spin" size={18}/> : 'Trimite Cererea'}
        </button>
      </div>
    )}
  </div>
)}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;