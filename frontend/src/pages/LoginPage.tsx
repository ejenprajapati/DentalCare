import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoTooth from '../assets/tooth-logo.png';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically make an API call to your Django backend
    console.log('Login data:', formData);
    // Example API call:
    // axios.post('/api/login/', formData)
    //   .then(response => {
    //     // Handle successful login
    //   })
    //   .catch(error => {
    //     // Handle errors
    //   });
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-container">
        <div className="auth-image">
          <img src={logoTooth} alt="Dental Care Logo" className="tooth-logo" />
          <h2>DENTAL CARE</h2>
        </div>
        
        <div className="auth-form-container">
          <h2>Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <input
                type="email"
                name="email"
                placeholder="Enter your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-lock"></i>
              </div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe">Remember Me</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>
            
            <button type="submit" className="btn btn-primary btn-block">
              Log in
            </button>
          </form>
          
          <p className="auth-redirect">
            Not member yet? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;