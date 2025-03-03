// components/Header.js

import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
function Header() {
  const location = useLocation();
  
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
            <li>
              <Link 
                to="/blogs" 
                className={location.pathname === '/blogs' ? 'active' : ''}
              >
                Blogs
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className={location.pathname === '/about' ? 'active' : ''}
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className={location.pathname === '/contact' ? 'active' : ''}
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="auth-buttons">
          <Link to="/ai-checkup" className="ai-checkup-btn">
            <img src="/icons/ai-icon.svg" alt="AI" width="20" height="20" />
            AI Checkup
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;