
import { Link } from 'react-router-dom';

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
            <i className="fab fa-facebook"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-youtube"></i>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-linkedin"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-twitter"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;