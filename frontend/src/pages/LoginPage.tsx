import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoTooth from '../assets/tooth-logo.png';
import api from "../api"
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

interface LoginPageProps {
  route: string;  // Optional route string parameter

}

function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const [loading, setLoading]= useState(false);
  const navigate= useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    
    try{
      const res= await api.post("/api/token/", {username: formData.username ,password: formData.password})
      localStorage.setItem(ACCESS_TOKEN, res.data.access)
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh)
      navigate("/")
    }catch(error){
      alert(error)

    }finally{
      setLoading(false)

    }
    
    
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
                type="username"
                name="username"
                placeholder="Username"
                value={formData.username}
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