import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Loader2, Shield, Briefcase, ArrowRight, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    organizationName: '',
    faculty: '',
    yearOfStudy: '',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Organizer Request State
  const [organizerRequestName, setOrganizerRequestName] = useState('');
  const [organizerRequestReason, setOrganizerRequestReason] = useState('');

  const handleOrganizerRequest = async (e) => {
    e.preventDefault();
    if (!organizerRequestName.trim()) {
      toast.error("Introdu numele organizației!");
      return;
    }
    setSaving(true);
    try {
      await api.post('/user/request-organizer', { 
        organizationName: organizerRequestName,
        reason: organizerRequestReason 
      });
      toast.success("Cererea a fost trimisă!");
      fetchProfile();
    } catch (error) {
       console.error("Request error:", error);
       toast.error(error.response?.data?.message || "Eroare la trimiterea cererii.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setUser(response.data);
      setProfileData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        phoneNumber: response.data.phoneNumber || '',
        organizationName: response.data.organizationName || '',
        faculty: response.data.studentFaculty || '',
        yearOfStudy: response.data.studentYear || '',
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Nu s-au putut încărca datele profilului.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/user/profile', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber,
        organizationName: user.role === 'ORGANIZER' ? profileData.organizationName : undefined,
        faculty: user.role === 'STUDENT' ? profileData.faculty : undefined,
        yearOfStudy: user.role === 'STUDENT' ? parseInt(profileData.yearOfStudy) : undefined,
      });
      toast.success("Profil actualizat cu succes!");
      
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        storedUser.firstName = profileData.firstName;
        localStorage.setItem('user', JSON.stringify(storedUser));
        window.dispatchEvent(new Event('storage')); 
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Eroare la actualizarea profilului.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Parolele noi nu coincid!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Parola nouă trebuie să aibă minim 6 caractere.");
      return;
    }

    setSaving(true);
    try {
      await api.put('/user/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success("Parola a fost schimbată!");
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error("Password error:", error);
      toast.error(error.response?.data?.message || "Eroare la schimbarea parolei.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-20 pt-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Setări Cont</h1>
            <p className="text-gray-500 mt-2 text-lg">Gestionează-ți profilul, securitatea și preferințele.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-72 space-y-3 shrink-0">
            {[
                { id: 'profile', label: 'Profilul Meu', icon: User, desc: 'Date personale' },
                { id: 'security', label: 'Securitate', icon: Lock, desc: 'Parolă & acces' },
                { id: 'organizer', label: 'Organizator', icon: Briefcase, desc: 'Status & cereri' }
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                        activeTab === tab.id
                            ? 'bg-white shadow-lg shadow-orange-500/5 text-gray-900 ring-1 ring-orange-100'
                            : 'bg-transparent hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-900'
                    }`}
                >
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-2.5 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-gradient-to-br from-primary to-orange-500 text-white shadow-md' : 'bg-gray-100 group-hover:bg-gray-50 text-gray-400'}`}>
                            <tab.icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <span className="block text-sm font-bold">{tab.label}</span>
                            <span className="text-[10px] font-medium opacity-60 uppercase tracking-wider">{tab.desc}</span>
                        </div>
                    </div>
                    {activeTab === tab.id && (
                        <motion.div 
                            layoutId="activeTabIndicator"
                            className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-orange-500 rounded-r-full"
                        />
                    )}
                    <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? 'text-primary translate-x-1' : 'text-gray-300 group-hover:text-gray-400'}`} />
                </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-xl shadow-gray-200/50 border border-white"
                >
            
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-8">
                
                {/* Profile Header Card */}
                <div className="bg-gray-50/80 rounded-[2rem] p-6 flex items-center gap-6 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-blue-600/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary/20 shrink-0 relative z-10">
                        {profileData.firstName ? profileData.firstName[0].toUpperCase() : 'U'}
                    </div>
                    <div className="flex flex-col relative z-10">
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-0.5">
                            {profileData.firstName} {profileData.lastName}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium mb-3">{user?.email}</p>
                        <div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                {user?.role || 'STUDENT'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prenume</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nume</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="07xxxxxxxx"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email-ul nu poate fi schimbat.</p>
                  </div>

                  {user?.role === 'ORGANIZER' && (
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nume Organizație</label>
                        <input
                          type="text"
                          value={profileData.organizationName}
                          onChange={(e) => setProfileData({...profileData, organizationName: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                     </div>
                  )}

                  {user?.role === 'STUDENT' && (
                     <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Facultate</label>
                            <select
                                value={profileData.faculty}
                                onChange={(e) => setProfileData({...profileData, faculty: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            >
                                <option value="">Selectează Facultatea</option>
                                <option value="FIESC">FIESC</option>
                                <option value="FEAA">FEAA</option>
                                <option value="MEDICINA">Medicina</option>
                                <option value="DREPT">Drept</option>
                                <option value="LITERE">Litere</option>
                                <option value="SILVICULTURA">Silvicultura</option>
                                <option value="MECANICA">Mecanica</option>
                                <option value="ISTORIE">Istorie</option>
                                <option value="SPORT">Sport</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">An de Studiu</label>
                            <select
                                value={profileData.yearOfStudy}
                                onChange={(e) => setProfileData({...profileData, yearOfStudy: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            >
                                <option value="">Selectează Anul</option>
                                <option value="1">Anul 1</option>
                                <option value="2">Anul 2</option>
                                <option value="3">Anul 3</option>
                                <option value="4">Anul 4</option>
                            </select>
                        </div>
                     </>
                  )}
                </div>

                <div className="pt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white px-8 py-3 rounded-2xl font-semibold text-sm shadow-xl shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? 'Se salvează...' : 'Salvează Profilul'}</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handlePasswordChange} className="space-y-10">
                <div className="flex items-center space-x-5">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-red-500/20 ring-4 ring-white">
                        <Shield className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Securitate și Parolă</h2>
                        <p className="text-gray-500 font-medium">Gestionează accesul la contul tău</p>
                    </div>
                </div>

                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parola Curentă</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      required
                    />
                  </div>
                  
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parola Nouă</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmă Parola Nouă</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl font-semibold text-sm shadow-xl shadow-gray-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    <span>{saving ? 'Se procesează...' : 'Actualizează Parola'}</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'organizer' && (
              <div className="space-y-10">
                <div className="flex items-center space-x-5">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/20 ring-4 ring-white">
                        <Briefcase className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Cont Organizator</h2>
                        <p className="text-gray-500 font-medium">Statutul tău în comunitate</p>
                    </div>
                </div>

                {user?.role === 'ADMIN' ? (
                    <div className="p-8 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl text-purple-900 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Shield className="w-32 h-32" />
                        </div>
                        <h3 className="font-black text-xl mb-3 flex items-center gap-2 italic uppercase tracking-tighter">
                            <Shield className="w-7 h-7" /> Status Administrator
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <p className="text-gray-700 leading-relaxed">
                                Ești logat cu un cont de <strong>Administrator Sistem</strong>. Acest rang îți oferă autoritate deplină asupra platformei EventManager.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm font-medium text-purple-800">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" /> Aprobare / Respingere Evenimente
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" /> Moderare Organizatori
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" /> Gestionare Utilizatori
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" /> Statistici Globale
                                </li>
                            </ul>
                        </div>
                    </div>
                ) : user?.role === 'ORGANIZER' ? (
                    <div className="p-6 bg-green-50 border border-green-100 rounded-xl text-green-800">
                        <h3 className="font-bold text-lg mb-2">Felicitări!</h3>
                        <p>Ești deja organizator activ pentru: <strong>{user.organizationName}</strong>.</p>
                        <p className="mt-2 text-sm">Poți crea și gestiona evenimente din Dashboard.</p>
                    </div>
                ) : user?.pendingUpgradeRequest ? (
                    <div className="p-6 bg-yellow-50 border border-yellow-100 rounded-xl text-yellow-800">
                        <h3 className="font-bold text-lg mb-2">Cerere în Așteptare</h3>
                        <p>Ai solicitat upgrade pentru organizația: <strong>{user.pendingOrganizationName || "..."}</strong>.</p>
                        <p className="mt-2 text-sm">Un administrator va revizui cererea ta în curând.</p>
                    </div>
                ) : (
                    <form onSubmit={handleOrganizerRequest} className="space-y-4 max-w-lg">
                        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 mb-4 border border-gray-100">
                            Ca organizator, vei putea publica evenimente, scana bilete și gestiona participarea studenților.
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Numele Organizației / Asociației</label>
                            <input
                              type="text"
                              value={organizerRequestName}
                              onChange={(e) => setOrganizerRequestName(e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                              required
                              placeholder="ex: Liga Studenților FIESC"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">De ce dorești să devii organizator?</label>
                            <textarea
                              value={organizerRequestReason}
                              onChange={(e) => setOrganizerRequestReason(e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px]"
                              required
                              placeholder="Descrie pe scurt activitățile tale..."
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                          <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-semibold text-sm shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                          >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                            <span>{saving ? 'Se trimite...' : 'Trimite Solicitarea'}</span>
                          </button>
                        </div>
                    </form>
                )}
              </div>
            )}

                </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
