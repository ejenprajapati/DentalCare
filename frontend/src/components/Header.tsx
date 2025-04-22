import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png';
import searchLogo from '../assets/searchLogo.png';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface UserProfile {
  role: string;
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access'); // Check if token exists in localStorage
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getAuthToken = () => {
    return localStorage.getItem('access') || localStorage.getItem('token');
  };

  const getAuthHeader = () => {
    const token = getAuthToken();
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/user/profile/`, {
          headers: getAuthHeader(),
        });

        setUserProfile(response.data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const isDentist = userProfile?.role === 'dentist';

  const handleAuthAction = () => {
    if (isLoggedIn) {
      localStorage.clear(); // Clear localStorage on logout, as per App.js
      navigate('/login'); // Redirect to login page
    } else {
      navigate('/login'); // Redirect to login page
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo-container">
          <Link to="/">
            <img src={logo} alt="Dental Care" className="logo" />
            <span className="logo-text">DENTAL CARE</span>
          </Link>
        </div>
        
        <nav className="main-nav">
          <ul>
            <li>
            <Link 
                  to={isDentist ? '/dashboard' : '/'} 
                  className={location.pathname === (isDentist ? '/schedule' : '/') ? 'active' : ''}
                >
                  {isDentist ? 'Dashboard' : 'Home'}
                </Link>
            </li>
            <li>
            <Link 
                  to="/services" 
                  className={location.pathname === '/services' ? 'active' : ''}
                >
                  Services
                </Link>
            </li>
            <li>
            <Link 
                  to={isDentist ? '/patients' : '/appointment'} 
                  className={location.pathname === (isDentist ? '/patients' : '/appointment') ? 'active' : ''}
                >
                  {isDentist ? 'Appointments' : 'Appointment'}
                </Link>
            </li>
            {isLoggedIn && (
              <li>
                <Link 
                  to={isDentist ? '/dentist-appointment' : '/analysis-history'} 
                  className={location.pathname === (isDentist ? '/dentist-appointment' : '/analysis-history') ? 'active' : ''}
                >
                  {isDentist ? 'Schedule' : 'My-Analysis'}
                </Link>
              </li>
            )}
            {!isLoggedIn && (
              <li>
                <Link 
                  to="/about" 
                  className={location.pathname === '/about' ? 'active' : ''}
                >
                  About
                </Link>
              </li>
            )}
            {!isDentist && (
              <li>
                <Link 
                  to="/patient-appointments" 
                  className={location.pathname === '/patient-appointments' ? 'active' : ''}
                >
                  My Appointments
                </Link>
              </li>
            )}
            {isLoggedIn && (
              <li>
                <Link 
                  to="/profile" 
                  className={location.pathname === '/profile' ? 'active' : ''}
                >
                  Profile
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        <div className="auth-buttons flex gap-2">
          <Link to="/ai-checkup" className="ai-checkup-btn">
            <img src={searchLogo} alt="AI" width="20" height="20" />
            AI Checkup
          </Link>
          <button 
            onClick={handleAuthAction}
            className="auth-btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {isLoggedIn ? 'Logout' : 'Login'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;