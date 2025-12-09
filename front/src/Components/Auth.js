import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    faculty: '', 
    role: 'user' 
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage('');
    setError('');

    setFormData({ 
        firstName: '', lastName: '', email: '', password: '', confirmPassword: '', 
        faculty: '', role: 'user' 
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
            studentFaculty: formData.faculty,
            role: [formData.role] 
        };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ceva nu a mers bine.');
      }

      if (isLogin) {

        localStorage.setItem('user', JSON.stringify(data)); 
        navigate('/home'); 
      } else {
        setMessage("Cont creat cu succes! Te rugam sa te autentifici.");
        setIsLogin(true); 
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{isLogin ? 'Bine ai venit!' : 'Creeaza cont'}</h2>
        
        {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
        {message && <div style={{color: 'green', marginBottom: '10px'}}>{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          
          
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
                <label>Facultate</label>
                <select name="faculty" value={formData.faculty} onChange={handleChange} required className="auth-select">
                    <option value="">Alege facultatea...</option>
                    <option value="FIESC">Facultatea de Inginerie Electrica si Stiinta Calculatoarelor</option>
                    <option value="MEDICINA">Facultatea de Medicina si Stiinte Biologice</option>
                    <option value="LITERE">Facultatea de Litere si Stiinte ale Comunicarii</option>
                    <option value="DREPT">Facultatea de Drept si Stiinte Administrative</option>
                </select>
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
            <div className="form-group">
              <label>Confirmă Parola</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          )}

          <button type="submit" className="buton-auth">
            {isLogin ? 'AUTENTIFICARE' : 'INREGISTRARE'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? 'Nu ai un cont?' : 'Ai deja un cont?'}
            <span className="toggle-link" onClick={toggleMode}>
              {isLogin ? ' Inregistreaza-te aici' : ' Logheaza-te aici'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;