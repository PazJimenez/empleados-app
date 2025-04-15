// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginForm.css';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    /*id: '',  // Estos campos pueden no ser necesarios para el login
    token: '',  // pero los incluimos por si acaso
    tokenExpiration: null*/
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!credentials.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }
    if (!credentials.password) {
      newErrors.password = 'La contraseña es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
    // Limpiar el error específico cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setLoginError('');
    
    try {
      await authService.login(credentials);
      navigate('/dashboard'); // Redirige al dashboard después del login
    } catch (error) {
      console.error('Error de login:', error);
      setLoginError(
        error.response?.data?.message || 
        'Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              value={credentials.username}
              onChange={handleChange}
              placeholder="Ingrese su usuario"
            />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              value={credentials.password}
              onChange={handleChange}
              placeholder="Ingrese su contraseña"
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>
          
          {loginError && <div className="alert alert-danger">{loginError}</div>}
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;