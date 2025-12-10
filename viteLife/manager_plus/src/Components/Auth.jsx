import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; 


import api from '../services/api'; 

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      bodyData = {
        email: formData.email,
        password: formData.password
      };
    } else {
      bodyData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        role: formData.role 
      };

      if (formData.role === 'student') {
        bodyData.studentFaculty = formData.faculty;
        bodyData.studentYear = formData.studentYear ? parseInt(formData.studentYear, 10) : null;
      } else if (formData.role === 'organizer') {
        bodyData.organizationName = formData.organizationName;
      }
    }

    try {

      const response = await api.post(endpoint, bodyData);


      const data = response.data;


if (isLogin) {

  console.log("User data received:", data);
  localStorage.setItem('user', JSON.stringify(data));


  const roles = data.roles || [];


  const isAdmin = roles.some(role => role.toUpperCase().includes('ADMIN'));
  const isOrganizer = roles.some(role => role.toUpperCase().includes('ORGANIZER'));


  if (isAdmin) {
    console.log("Utilizator Admin detectat -> /admin");
    navigate('/admin'); 
  } else if (isOrganizer) {
    console.log("Utilizator Organizator detectat -> /organizer");
    navigate('/organizer');
  } else {
    console.log("Utilizator Student/Simplu -> /home");
    navigate('/home');
  }
}else {
     
        setMessage("Cont creat cu succes! Te rugam sa te autentifici.");
        setIsLogin(true);
        setFormData((prev) => ({...prev, password: '', confirmPassword: ''}));
      }

    } catch (err) {
      console.error("Eroare:", err);
      
      
      const errorMessage = err.response?.data?.message || err.message || 'Eroare la procesarea cererii.';
      setError(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        <h2 className="auth-title">{isLogin ? 'Autentificare' : 'Inregistrare'}</h2>
        
        {error && <div style={{color: '#ef4444', marginBottom: '15px', fontSize: '14px'}}>{error}</div>}
        {message && <div style={{color: '#10b981', marginBottom: '15px', fontSize: '14px'}}>{message}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Prenume</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Nume</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Telefon</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Parolă</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>Confirmă Parola</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Rol</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="student">Student</option>
                  <option value="organizer">Organizator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {formData.role === 'student' && (
                <>
                  <div className="form-group">
                    <label>Facultate</label>
                    <input type="text" name="faculty" value={formData.faculty} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>An de studiu</label>
                    <input type="number" name="studentYear" value={formData.studentYear} onChange={handleChange} required />
                  </div>
                </>
              )}

              {formData.role === 'organizer' && (
                <div className="form-group">
                  <label>Nume Organizație</label>
                  <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} required />
                </div>
              )}
            </>
          )}

          <button type="submit" className="buton-auth">
            {isLogin ? 'Intră în cont' : 'Creează cont'}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? 'Nu ai cont?' : 'Ai deja cont?'}
          <span 
            className="toggle-link"
            onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
          >
            {isLogin ? ' Inregistreaza-te' : ' Logheaza-te'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;