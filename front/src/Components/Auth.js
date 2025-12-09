import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Asigură-te că acest fișier există

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

    const baseUrl = 'http://localhost:8080/api/auth';
    const url = isLogin ? `${baseUrl}/signin` : `${baseUrl}/signup`;

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
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la procesarea cererii.');
      }

      if (isLogin) {
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/home');
      } else {
        setMessage("Cont creat cu succes! Te rugăm să te autentifici.");
        setIsLogin(true);
        setFormData((prev) => ({...prev, password: '', confirmPassword: ''}));
      }

    } catch (err) {
      console.error("Eroare:", err);
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      {/* Am schimbat auth-box în auth-card conform CSS */}
      <div className="auth-card">
        
        {/* Am adăugat clasa auth-title */}
        <h2 className="auth-title">{isLogin ? 'Autentificare' : 'Înregistrare'}</h2>
        
        {/* Mesaje de eroare/succes */}
        {error && <div style={{color: '#ef4444', marginBottom: '15px', fontSize: '14px'}}>{error}</div>}
        {message && <div style={{color: '#10b981', marginBottom: '15px', fontSize: '14px'}}>{message}</div>}

        {/* Am adăugat clasa auth-form */}
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

          {/* Am schimbat clasa în buton-auth */}
          <button type="submit" className="buton-auth">
            {isLogin ? 'Intră în cont' : 'Creează cont'}
          </button>
        </form>

        {/* Am schimbat clasele pentru footer */}
        <div className="auth-footer">
          {isLogin ? 'Nu ai cont?' : 'Ai deja cont?'}
          <span 
            className="toggle-link"
            onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
          >
            {isLogin ? ' Înregistrează-te' : ' Loghează-te'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;