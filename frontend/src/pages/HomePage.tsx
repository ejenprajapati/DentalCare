
import { Link } from 'react-router-dom';
import aiRobot from '../assets/ai-robot.png';
import dentistImage from '../assets/dentist_pic.jpg';
import { useNavigate } from 'react-router-dom';


function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome To Dental Care!</h1>
            <p>
              At Dental Care, we combine advanced artificial intelligence
              technology with modern dentistry to revolutionize how you care
              for your oral health. Our platform provides quick and accurate
              dental analysis to help you make informed decisions about your
              smile.
            </p>
            <div className="hero-buttons">
              <Link to="/ai-checkup" className="btn btn-primary">Get AI Analysis</Link>
              <div className="emergency-contact">
                <div className="phone-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <div>
                  <p>Dental 24H Emergency</p>
                  <p>Contact <strong>Number</strong></p>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <img src={aiRobot} alt="AI Dental Assistant" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <div className="service-cards">
            <div className="service-card">
              <div className="service-icon">
                <img src="/icons/root-canal.svg" alt="Root Canal" />
              </div>
              <h3>Root Canal Treatment</h3>
              <p>
                Root canal treatment (endodontics) is a dental procedure used to treat
                infection at the centre of a tooth.
              </p>
              <a href="/services/root-canal" className="learn-more">Learn More</a>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <img src="/icons/cosmetic.svg" alt="Cosmetic Dentist" />
              </div>
              <h3>Cosmetic Dentist</h3>
              <p>
                Cosmetic dentistry is the branch of dentistry that focuses on improving
                the appearance of your smile.
              </p>
              <a href="/services/cosmetic" className="learn-more">Learn More</a>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <img src="/icons/implants.svg" alt="Dental Implants" />
              </div>
              <h3>Dental Implants</h3>
              <p>
                A dental implant is an artificial tooth root that's placed into your jaw to hold
                a prosthetic tooth or bridge.
              </p>
              <a href="/services/implants" className="learn-more">Learn More</a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="dentist-image">
            <img src={dentistImage} alt="Dentist working" />
          </div>
          
          <div className="why-choose-content">
            <h2>Why Choose DentalCare For Your Dental Treatments?</h2>
            <p>
              We use only the best quality materials on the market in order
              to provide the best products to our patients.
            </p>
            
            <ul className="benefits-list">
              <li>Top quality dental team</li>
              <li>Artificial Intelligence for remote Dental Checkup</li>
              <li>Enrollment is quick and easy</li>
            </ul>
            
            <button className="btn btn-primary"  onClick={() => navigate('/appointment')}>Book an appointment</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
