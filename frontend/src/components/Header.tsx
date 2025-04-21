import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access'); // Check if token exists in localStorage

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
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
              >
                Home
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
                to="/appointment" 
                className={location.pathname === '/appointment' ? 'active' : ''}
              >
                Appointment
              </Link>
            </li>
            {isLoggedIn && (
              <li>
                <Link 
                  to="/analysis-history" 
                  className={location.pathname === '/analysis-history' ? 'active' : ''}
                >
                  My Analysis
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
            <img src="/icons/ai-icon.svg" alt="AI" width="20" height="20" />
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