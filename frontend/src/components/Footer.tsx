
import { Link } from 'react-router-dom';
import facbook from '../assets/facebook.png';
import insta from '../assets/instagram.png';
import twitter from '../assets/twitter.png';
import youtube from '../assets/youtube.png';
import linkedin from '../assets/linkedin.png';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-logo">
          <Link to="/">DENTAL CARE</Link>
        </div>
        
        <div className="footer-links">
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/service">Service</Link></li>
              <li><Link to="/blogs">Blogs</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>
        </div>
        
        <div className="footer-info">
          <p>All rights reserved © dentalcare.com.np | Terms and conditions apply!</p>
        </div>
        
        <div className="social-links">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <img src={facbook}alt="phone" style={{ width: '50px', height: '50px' }} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <img src={insta}alt="phone" style={{ width: '50px', height: '50px' }} />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
            <img src={youtube}alt="phone" style={{ width: '50px', height: '50px' }} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <img src={linkedin}alt="phone" style={{ width: '50px', height: '50px' }} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <img src={twitter}alt="phone" style={{ width: '50px', height: '50px' }} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;