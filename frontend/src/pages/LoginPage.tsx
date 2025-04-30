import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoTooth from '../assets/tooth-logo.png';
import api from "../api"
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear error messages when user starts typing again
    setErrorMessage('');
  };

  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setErrorMessage('');
    e.preventDefault();
    
    try {
      const res = await api.post("/api/token/", {username: formData.username, password: formData.password});
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      
      // Get user details to check role
      const userRes = await api.get("http://127.0.0.1:8000/api/user/profile", {
        headers: {
          Authorization: `Bearer ${res.data.access}`
        }
      });
      
      // Redirect based on role
      if (userRes.data.role === 'dentist') {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch(error: any) {
      console.error("Login error:", error);
      
      if (error.response?.status === 401) {
        // Check if user exists using your existing endpoint
        try {
          await api.post("/api/user/check-username/", { username: formData.username });
          // If we get here, the user exists but password is wrong
          setErrorMessage("Incorrect Password.");
        } catch (checkError: any) {
          if (checkError.response?.status === 404) {
            // User doesn't exist
            setErrorMessage("User not found.");
          } else {
            // Some other error with the check
            setErrorMessage("Invalid username or password.");
          }
        }
      } else if (error.request) {
        // Request was made but no response received
        setErrorMessage("Network error. Please check your connection.");
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          
          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}
          
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
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button 
                  type="button" 
                  className="toggle-password-btn"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
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
            
            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log in'}
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