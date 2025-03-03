import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoTooth from '../assets/tooth-logo.png';

function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    // Here you would typically make an API call to your Django backend
    console.log('Signup data:', formData);
    // Example API call:
    // axios.post('/api/register/', formData)
    //   .then(response => {
    //     // Handle successful registration
    //   })
    //   .catch(error => {
    //     // Handle errors
    //   });
  };

  return (
    <div className="auth-page signup-page">
      <div className="auth-container">
        <div className="auth-image">
          <img src={logoTooth} alt="Dental Care Logo" className="tooth-logo" />
          <h2>DENTAL CARE</h2>
        </div>
        
        <div className="auth-form-container">
          <h2>Create An Account</h2>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-user"></i>
              </div>
              <input
                type="text"
                name="name"
                placeholder="Type your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
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
            
            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-lock"></i>
              </div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-type Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-options">
              <div className="terms-checkbox">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="agreeTerms">I agree with Terms and Privacy</label>
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary btn-block">
              Sign up
            </button>
          </form>
          
          <p className="auth-redirect">
            Have account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default SignupPage;