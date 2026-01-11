import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Heart, LogOut, UserPlus, LogIn, Menu, X, Calendar, LayoutDashboard } from 'lucide-react';
import api from '../services/api';
import './Navbar.css';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  const PATH_SIGNIN = '/auth/signin';
  const PATH_SIGNUP = '/auth/signup';
  const isSigninPage = location.pathname === PATH_SIGNIN;
  const isSignupPage = location.pathname === PATH_SIGNUP;
  const isAuthPage = location.pathname.startsWith('/auth');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchUnreadCount();
      } catch (e) { setUser(null); }
    } else {
      setUser(null);
      setUnreadCount(0);
    }
    setIsMenuOpen(false);
  }, [location]);

  const fetchUnreadCount = async () => {
    if (!localStorage.getItem('user')) return;
    try {
      const response = await api.get('/notifications');
      const count = (Array.isArray(response.data) ? response.data : []).filter(n => !n.isRead).length;
      setUnreadCount(count);
    } catch (error) { console.error(error); }
  };

  const handleLogout = (e) => {
    e.stopPropagation();
    localStorage.removeItem('user');
    setUser(null); 
    navigate(PATH_SIGNIN);
  };

  const isStudent = user?.roles?.includes('ROLE_STUDENT');
  const isOrganizer = user?.roles?.includes('ROLE_ORGANIZER');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  return (
    <nav className="nb-container">
      <div className="nb-content">
        <Link to="/" className="nb-logo">EventManager</Link>

        {!isAuthPage && user && (
          <button className="nb-mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}

        <div className={`nb-center-menu ${isMenuOpen ? 'open' : ''}`}>
          {!isAuthPage && user && (
            <>
              {/* Secțiune comună / Elevi */}
              {(isStudent || isAdmin) && (
                <Link to="/home" className={`nb-link ${location.pathname === '/home' ? 'active' : ''}`}>
                  Evenimente
                </Link>
              )}

              {isStudent && (
                <>
                  <Link to="/my-tickets" className={`nb-link ${location.pathname === '/my-tickets' ? 'active' : ''}`}>
                    Biletele Mele
                  </Link>
                  <Link to="/favorites" className={`nb-link nb-fav ${location.pathname === '/favorites' ? 'active' : ''}`}>
                    Favorite
                  </Link>
                </>
              )}
              
              {/* SECȚIUNE ORGANIZATOR ÎN NAVBAR */}
              {isOrganizer && (
                <>
                  <Link to="/home" className={`nb-link ${location.pathname === '/home' ? 'active' : ''}`}>
                    Evenimente
                  </Link>
                  <Link to="/organizer" className={`nb-link ${location.pathname === '/organizer' ? 'active' : ''}`}>
                    Evenimentele Mele
                  </Link>
                </>
              )}
              
              {isAdmin && (
                <Link to="/admin" className={`nb-link nb-admin ${location.pathname === '/admin' ? 'active' : ''}`}>
                  Panou Admin
                </Link>
              )}
            </>
          )}
        </div>

        <div className="nb-right">
          {user ? (
            <>
           
                <div className="nb-bell-wrapper">
                   <NotificationBell/>
                  {unreadCount > 0 && <span className="nb-bell-dot">{unreadCount}</span>}
                </div>


              <div className="nb-profile-capsule" onClick={() => navigate('/settings')}>
                <div className="nb-avatar">{user.firstName?.[0].toUpperCase()}</div>
                <div className="nb-user-info hide-on-mobile">
                  <span className="nb-username">{user.firstName}</span>
                  <span className="nb-subtitle">Contul meu</span>
                </div>
                <div className="nb-divider hide-on-mobile"></div>
                <button onClick={handleLogout} className="nb-logout-btn"><LogOut size={18} /></button>
              </div>
            </>
          ) : (
           <div className="nb-auth-toggle">
              {!isSigninPage ? (
                <Link to={PATH_SIGNIN} className="nb-auth-btn login">
                  <LogIn size={18} /> <span>Autentificare</span>
                </Link>
              ) : (
                 <Link to={PATH_SIGNUP} className="nb-auth-btn signup">
                  <UserPlus size={18} /> <span>Cont Nou</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;