import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoTooth from '../assets/tooth-logo.png';
import api from "../api"




function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  // const unusedVars = { route, method };

  const [loading, setLoading]= useState(false);
  const navigate= useNavigate()
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    try{
      const res= await api.post("/api/user/register/", {username: formData.username,email: formData.email, password: formData.password})
      navigate("/login")
    }catch(error){
      alert(error)

    }finally{
      setLoading(false)

    }
    
    
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
                placeholder="Type your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-user"></i>
              </div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
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