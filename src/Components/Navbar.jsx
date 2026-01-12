import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap, LogIn, LogOut, User, Ticket, PlusCircle, Heart, Bell, Settings, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import NotificationDropdown from './ui/NotificationDropdown';
import api from '../services/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingAdminCount, setPendingAdminCount] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Function to check auth state
  const checkAuth = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
      setUnreadCount(0);
      setPendingAdminCount(0);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
        const response = await api.get('/notifications');
        const count = response.data.filter(n => !n.isRead).length;
        setUnreadCount(count);
    } catch (error) {
        console.error("Failed to fetch notifications count", error);
    }
  };

  const fetchPendingAdminCount = async () => {
      if (!user) return;
      try {
          const response = await api.get('/admin/pending-events');
          if (Array.isArray(response.data)) {
              setPendingAdminCount(response.data.length);
          }
      } catch (error) {
          console.error("Failed to fetch pending admin events", error);
      }
  };

  useEffect(() => {
    checkAuth();
  }, [location]);

  useEffect(() => {
    if (user) {
        // Logic for Students/Organizers
        if (!user.roles?.includes('ROLE_ADMIN')) {
            fetchUnreadCount();
        }
        
        // Logic for Admins
        if (user.roles?.includes('ROLE_ADMIN')) {
            fetchPendingAdminCount();
        }

        // Polling every minute
        const interval = setInterval(() => {
            if (user.roles?.includes('ROLE_ADMIN')) {
                fetchPendingAdminCount();
            } else {
                fetchUnreadCount();
            }
        }, 60000);

        return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowNotifications(false);
    toast.success("Te-ai delogat cu succes!");
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Helper for Nav Links to ensure consistency
  const NavLink = ({ to, children, icon: Icon }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={`
          relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 no-underline
          ${active 
            ? 'bg-primary/5 shadow-sm ring-1 ring-primary/10 font-bold' 
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }
        `}
      >
        {Icon && <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`} />}
        <span className={active ? 'bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent' : ''}>
            {children}
        </span>
      </Link>
    );
  };

  const isOrganizer = user && user.roles && user.roles.includes('ROLE_ORGANIZER');
  const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');
  const isStudent = user && user.roles && user.roles.includes('ROLE_STUDENT');

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
      
      {/* Backdrop for closing notifications */}
      {showNotifications && (
          <div 
            className="fixed inset-0 z-40 bg-transparent cursor-default" 
            onClick={() => setShowNotifications(false)}
          ></div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-50">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="group no-underline">
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent hover:to-primary transition-all duration-300">
              EventManager
            </span>
          </Link>

          {/* Desktop Navigation - Absolute Center */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-gray-50/50 p-1.5 rounded-full border border-gray-100/50 backdrop-blur-sm">
            <NavLink to="/events">Evenimente</NavLink>

            {/* Role Based Links */}
            {isStudent && (
              <>
                <NavLink to="/my-tickets">Biletele Mele</NavLink>
                <NavLink to="/favorites">Favorite</NavLink>
              </>
            )}

            {isOrganizer && (
               <>
                <NavLink to="/my-events">Evenimentele Mele</NavLink>
                <NavLink to="/scan" icon={Scan}>Scanare</NavLink>
               </>
            )}

            {isAdmin && (
              <NavLink to="/admin">
                  Admin Panel
                  {pendingAdminCount > 0 && (
                    <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                    </span>
                  )}
              </NavLink>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {/* Notification Bell with Dropdown - Hidden for Admins */}
            {(isStudent || isOrganizer) && (
               <div className="relative">
                   <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`
                        relative p-2.5 rounded-full transition-all duration-300 group
                        ${showNotifications 
                            ? 'bg-white text-primary shadow-md ring-1 ring-gray-100' 
                            : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-md hover:ring-1 hover:ring-gray-100'
                        }
                    `}
                  >
                    <Bell className={`w-5 h-5 transition-transform duration-300 ${showNotifications ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-12'}`} />
                    
                    {/* Dynamic Badge */}
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-2 ring-white"></span>
                        </span>
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {showNotifications && (
                        <NotificationDropdown 
                            onClose={() => setShowNotifications(false)} 
                            onUpdateUnreadCount={setUnreadCount}
                        />
                    )}
                  </AnimatePresence>
               </div>
            )}
            
            {/* User Profile Capsule */}
            {user ? (
                <div className="flex items-center p-1 pl-1.5 pr-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-gray-300 transition-all ml-2 gap-2">
                    <Link to="/settings" className="flex items-center gap-2.5 group cursor-pointer no-underline">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner ring-2 ring-white group-hover:scale-105 transition-transform">
                            {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col leading-none pr-1">
                            <span className="text-xs font-bold text-gray-700 group-hover:text-primary transition-colors">
                                {user.firstName}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">Contul meu</span>
                        </div>
                    </Link>
                    
                    <div className="h-6 w-px bg-gray-200 mx-0.5"></div>
                    
                    <div className="flex items-center">
                        <Link
                            to="/settings"
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all no-underline"
                            title="Setări"
                        >
                            <Settings className="w-4 h-4" />
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            title="Delogare"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <Link 
                    to={location.pathname === '/login' ? "/register" : "/login"} 
                    className="ml-2 no-underline"
                >
                    <button className="bg-gradient-to-r from-primary to-blue-600 hover:to-primary text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 flex items-center space-x-2 active:scale-95 border-none cursor-pointer">
                        <LogIn className="w-4 h-4" />
                        <span>{location.pathname === '/login' ? "Înregistrare" : "Autentificare"}</span>
                    </button>
                </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             {/* Notification Bell for Mobile */}
             {(isStudent || isOrganizer) && (
               <div className="relative">
                 <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-600"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </button>
               </div>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-primary focus:outline-none p-2 bg-gray-50 rounded-xl"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2 shadow-inner">
              <Link to="/events" onClick={() => setIsOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-600 font-medium">Evenimente</Link>
              
              {isStudent && (
                 <>
                    <Link to="/my-tickets" onClick={() => setIsOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-600 font-medium">Biletele Mele</Link>
                    <Link to="/favorites" onClick={() => setIsOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-600 font-medium">Favorite</Link>
                 </>
              )}
              
              {isOrganizer && (
                  <>
                    <Link to="/my-events" onClick={() => setIsOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-600 font-medium">Evenimentele Mele</Link>
                    <Link to="/scan" onClick={() => setIsOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-2">
                        <Scan className="w-4 h-4" />
                        <span>Scanare</span>
                    </Link>
                  </>
              )}

              {isAdmin && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-gray-50 text-primary font-bold flex justify-between items-center">
                      <span>Admin Panel</span>
                      {pendingAdminCount > 0 && (
                        <span className="flex h-3 w-3 relative mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                  </Link>
              )}

              {user && (
                 <>
                     <Link to="/notifications" onClick={() => setIsOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-600">Notificări</Link>
                     <Link to="/settings" onClick={() => setIsOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-600">Setări Cont</Link>
                 </>
              )}

              <div className="pt-4 border-t border-gray-100 mt-2 px-4">
                  {user ? (
                      <button onClick={() => {handleLogout(); setIsOpen(false);}} className="flex items-center justify-center gap-2 text-red-600 w-full py-3 bg-red-50 rounded-xl font-semibold">
                          <LogOut className="w-5 h-5" />
                          <span>Delogare</span>
                      </button>
                  ) : (
                      <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 bg-primary text-white w-full py-3 rounded-xl font-bold shadow-lg shadow-primary/20">
                          <LogIn className="w-5 h-5" />
                          <span>Autentificare</span>
                      </Link>
                  )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;