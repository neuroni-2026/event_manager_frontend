import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Settings.css';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, User, Lock, Save, Loader2, 
  Phone, KeyRound,
  Radius,
  University,
  Mail,
  Timer,
  Briefcase
} from 'lucide-react';
import OrganizerDashboard from './OrganizerDashboard';
import { CgOrganisation } from 'react-icons/cg';

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
const [requesting, setRequesting] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '', lastName: '', phoneNumber: '',
    email: '', role: '', faculty: '', organization: '', studentYear:''
  });

  const [passData, setPassData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [orgRequest, setOrgRequest] = useState({
    organizationName: '',
    reason: ''
  });

  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/profile');
        const data = response.data;
        
        setProfileData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber || '',
          email: data.email || '',
          role: data.role || '',
          faculty: data.faculty || '',
          organization: data.organizationName || '',
          studentYear: data.studentYear,
          pendingUpgradeRequest: data.pendingUpgradeRequest || false
        });
      } catch (error) {
        console.error("Eroare profil:", error);
        toast.error("Nu s-au putut încărca datele.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  
  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
  const handlePassChange = (e) => setPassData({ ...passData, [e.target.name]: e.target.value });
  const handleOrgRequestChange = (e) => setOrgRequest({ ...orgRequest, [e.target.name]: e.target.value });

  
  const handleSaveAll = async () => {
    setSaving(true);
    let hasError = false;

    
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
    } catch (error) {
      console.error(error);
      toast.error("Eroare la salvarea informațiilor de profil.");
      hasError = true;
    }

 
    if (passData.newPassword || passData.currentPassword) {
        if (!passData.currentPassword) {
             toast.error("Introdu parola curentă pentru a o schimba.");
             hasError = true;
        } else if (passData.newPassword !== passData.confirmPassword) {
             toast.error("Parolele noi nu coincid!");
             hasError = true;
        } else if (passData.newPassword.length < 6) {
             toast.error("Parola nouă trebuie să aibă minim 6 caractere.");
             hasError = true;
        } else {
             try {
                await api.put('/user/password', {
                    oldPassword: passData.currentPassword,
                    newPassword: passData.newPassword
                });
               
                setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
             } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || "Parola curentă incorectă.");
                hasError = true;
             }
        }
    }
   


    setSaving(false);
    if (!hasError) {
        toast.success("Modificările au fost salvate cu succes!");
    }
    
  };
   const handleSendOrgRequest = async () => {
    if (!orgRequest.organizationName.trim()) {
      toast.error("Numele organizației este obligatoriu.");
      return;
    }
    setRequesting(true);
    try {
      await api.post('/user/request-organizer', {
        organizationName: orgRequest.organizationName,
        reason: orgRequest.reason
      });
      toast.success("Cererea a fost trimisă cu succes!");
      fetchProfile();
    } catch (error) {

    } finally {
      setRequesting(false);
    }
};

  if (loading) return <div className="settings-loading"><Loader2 className="animate-spin" /> Se încarcă setările...</div>;

  return (
    <div className="settings-page-wrapper">
      <div className="settings-container">
        
       
        <div className="settings-header-group">
          <button className="back-btn" onClick={() => navigate('/home')}>
            ←
          </button>
          <div className="header-text">
            <h2>Setări cont</h2>
            <p>Gestionează informațiile contului tău</p>
          </div>
        </div>

      
        <div className="panel-card">
            <div className="panel-body">
                <div className="identity-content">
                    <div className="identity-avatar">
                        {profileData.firstName.charAt(0)}
                    </div>
                    <div className="identity-details">
                        <h3>{profileData.firstName} {profileData.lastName}</h3>
                        <p className="identity-email">{profileData.email}</p>
                        
                        <div className="badges-row">
                            <span className="role-badge">{profileData.role}</span>
                            {profileData.role === 'ORGANIZER' && profileData.organization && (
                                <span className="org-badge">{profileData.organization}</span>
                            )}
                            {profileData.role === 'STUDENT' && profileData.faculty && (
                                <span className="org-badge">{profileData.faculty}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {profileData.role === 'STUDENT' && (
          <div className="panel-card-request">
            <div className="request-header">
              <div className="request-icon-container">
                <Briefcase size={24} color="#3b82f6" />
              </div>
              <div className="request-title-group">
                <h3>Cont Organizator</h3>
                <p>Solicită drepturi de organizare evenimente</p>
              </div>
            </div>

            <div className="request-body">
              {profileData.pendingUpgradeRequest ? (
                <div className="pending-message">
                  Cererea ta este în curs de revizuire de către un administrator.
                </div>
              ) : (
                <>
                  <div className="info-box-light">
                    Ca organizator, vei putea publica evenimente, scana bilete și gestiona participarea studenților.
                  </div>

                  <div className="form-group">
                    <label>Numele Organizației / Asociației</label>
                    <input 
                      type="text" 
                      name="organizationName"
                      placeholder="ex: Liga Studenților FIESC"
                      className="settings-input-simple"
                      value={orgRequest.organizationName}
                      onChange={handleOrgRequestChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>De ce dorești să devii organizator?</label>
                    <textarea 
                      name="reason"
                      placeholder="Descrie pe scurt activitățile tale..."
                      className="settings-textarea"
                      value={orgRequest.reason}
                      onChange={handleOrgRequestChange}
                    />
                  </div>

                  <div className="request-actions">
                    <button className="btn-send-request" onClick={handleSendOrgRequest} disabled={requesting}>
                      {requesting ? <Loader2 className="animate-spin" size={18}/> : <Briefcase size={18}/>}
                      Trimite Cererea
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
  
        <div className="panel-card-info">
            <div className="panel-header">Informații Personale</div>
            <div className="panel-body">
                <div className="form-section">
                        <div className="form-group">
                        <label style={{color:"black"}}>Prenume</label>
                        <div className="input-with-icon">
                            <User size={18} className="field-icon"/>
                            <input  style={{padding:"0 16px 0 44px", border:"1px solid black"}}
                                type="text" name="firstName" className="settings-input"
                                value={profileData.firstName} onChange={handleProfileChange} 
                            />
                        </div>
                        </div>
                        <div className="form-group">
                        <label style={{color:"black"}}>Nume</label>
                        <div className="input-with-icon">
                            <User size={18} className="field-icon"/>
                            <input  style={{padding:"0 16px 0 44px", border:"1px solid black"}}
                                type="text" name="lastName" className="settings-input"
                                value={profileData.lastName} onChange={handleProfileChange} 
                            />
                        </div>
                        </div>

                    <div className="form-group">
                        <label style={{color:"black"}}>Telefon</label>
                        <div className="input-with-icon">
                            <Phone size={18} className="field-icon"/>
                            <input  style={{borderRadius:"30px", border:"1px solid black"}}
                                type="tel" name="phoneNumber" className="settings-input"
                                value={profileData.phoneNumber} onChange={handleProfileChange} 
                            />
                        </div>
                        </div>
                    <div className="form-group">
                        <label style={{color:"black"}}>Email</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="field-icon"/>
                            <input  style={{padding:"0 16px 0 44px", border:"1px solid black"}}
                                type="text" name="email" className="settings-input"
                                value={profileData.email} onChange={handleProfileChange} 
                            />
                        </div>
                        </div>
                    {profileData.role === 'STUDENT' && (
                       
                         <div className="form-group">
                            <label>Facultate</label>
                            <div className="input-with-icon">
                                <University size={18} className="field-icon" style={{zIndex: 1}}/>
                                <select 
                                    name="faculty" 
                                    className="settings-input"
                                    value={profileData.faculty} 
                                    onChange={handleProfileChange}
                                >
                                    <option value="FIESC">FIESC</option>
                                    <option value="FEAA">FEAA</option>
                                    <option value="Litere">Litere</option>
                                    <option value="Mecanica">Mecanică</option>
                                    <option value="Silvicultura">Silvicultură</option>
                                    <option value="Istorie">Istorie și Geografie</option>
                                    <option value="Drept">Drept și Științe Administrative</option>
                                    <option value="Medicina">Medicină și Științe Biologice</option>
                                </select>
                            </div>
                            
                        </div>
                    )}
                  
                    {profileData.role === 'ORGANIZER' && (
                         <div className="form-group">
                            <label>Organizație</label>
                            <div className="input-with-icon">
                                <CgOrganisation size={18} className="field-icon" style={{zIndex: 1}}/>
                                <input  style={{padding:"0 16px 0 44px", border:"1px solid black"}}
                                type="text" name="organization" className="settings-input"
                                value={profileData.organization} onChange={handleProfileChange} 
                            />
                            </div>
                        </div>
                    )}
                     {profileData.role === 'STUDENT' && (

                        <div className="form-group">
                                <label>An de studiu</label>
                                <div className="input-with-icon">
                                    <Timer size={18} className="field-icon" style={{zIndex: 1}}/>
                                    <select 
                                        name="studentYear" 
                                        className="settings-input"
                                        value={profileData.studentYear} 
                                        onChange={handleProfileChange}
                                    >
                                        <option value="">Selectează anul</option>
                                        <option value="1">Anul 1</option>
                                        <option value="2">Anul 2</option>
                                        <option value="3">Anul 3</option>
                                        <option value="4">Anul 4</option>
                                    </select>
                                </div>
                            </div>
    
                    )}

                </div>
            </div>
        </div>

      
        <div className="panel-card-footer">
            <div className="panel-header">Securitate</div>
            <div className="panel-body">
                <div className="form-section">
                    <div className="form-group">
                        <label style={{color:"black"}}>Parola Curentă</label>
                        <div className="input-with-icon">
                            <KeyRound size={18} className="field-icon"/>
                            <input 
                                type="password" name="currentPassword" className="settings-input"
                                placeholder="Doar dacă vrei să schimbi parola"
                                value={passData.currentPassword} onChange={handlePassChange} 
                            />
                        </div>
                    </div>


                        <div className="form-group">
                            <label style={{color:"black"}}>Parola Nouă</label>
                            <div className="input-with-icon">
                                <Lock size={18} className="field-icon"/>
                                <input 
                                    type="password" name="newPassword" className="settings-input"
                                    placeholder="Minim 6 caractere"
                                    value={passData.newPassword} onChange={handlePassChange} 
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label style={{color:"black"}}>Confirmă Parola</label>
                            <div className="input-with-icon">
                                <Lock size={18} className="field-icon"/>
                                <input 
                                    type="password" name="confirmPassword" className="settings-input"
                                    placeholder="Repetă parola nouă"
                                    value={passData.confirmPassword} onChange={handlePassChange} 
                                />
                            </div>
                        </div>

                </div>
            </div>
        </div>

       
        <div className="main-actions">
            <button className="btn-save-all" onClick={handleSaveAll} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} 
                Salvează Modificările
            </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;