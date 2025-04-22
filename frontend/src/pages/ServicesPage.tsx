import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import rootCanalImage from '../assets/rootcanal.png';
import cosmeticDentistryImage from '../assets/cosmetic-dentistry.png';
import implantsImage from '../assets/implants.jpg';
import teethWhiteningImage from '../assets/teeth-whitening.png';
import emergencyImage from '../assets/emergency.png';
import preventiveImage from '../assets/preventive.png';
// Define interfaces for our data types
interface User {
  id: number; 
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  role: string;
  gender: string | null;
  profile_picture_url: string;
  linkedin?: string;
}

interface Dentist {
  user: User;
  specialization: string | null;
  experience: string | null;
  qualification: string | null;
}

interface Service {
  id: number;
  icon: string;
  title: string;
  description: string;
  link: string;
}

const API_BASE_URL = 'http://127.0.0.1:8000';

const ServicesPage: React.FC = () => {
  const [specialists, setSpecialists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecialists = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await axios.get<Dentist[]>(`${API_BASE_URL}/api/dentists/`);
        setSpecialists(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching specialists:', err);
        setError('Failed to load specialists. Please try again later.');
        setLoading(false);
      }
    };

    fetchSpecialists();
  }, []);

  const services: Service[] = [
    {
      id: 1,
      icon: rootCanalImage,
      title: "Root Canal Treatment",
      description: "Root canal treatment (endodontics) is a dental procedure used to treat infection at the centre of a tooth.",
      link: "/services/root-canal"
    },
    {
      id: 2,
      icon: cosmeticDentistryImage,
      title: "Cosmetic Dentist",
      description: "Cosmetic dentistry is the branch of dentistry that focuses on improving the appearance of your smile.",
      link: "/services/cosmetic"
    },
    {
      id: 3,
      icon: implantsImage,
      title: "Dental Implants",
      description: "A dental implant is an artificial tooth root that's placed into your jaw to hold a prosthetic tooth or bridge.",
      link: "/services/implants"
    },
    {
      id: 4,
      icon: teethWhiteningImage,
      title: "Teeth Whitening",
      description: "It's never been easier to brighten your smile at home. There are all kinds of products you can try.",
      link: "/services/whitening"
    },
    {
      id: 5,
      icon: emergencyImage,
      title: "Emergency Dentistry",
      description: "In general, any dental problem that needs immediate treatment to stop bleeding, alleviate severe pain.",
      link: "/services/emergency"
    },
    {
      id: 6,
      icon: preventiveImage,
      title: "Prevention",
      description: "Preventive dentistry is dental care that helps maintain good oral health. a combination of regular dental.",
      link: "/services/prevention"
    }
  ];

  return (
    <div className="services-page">
      <section className="page-hero">
        <div className="container">
          <h1>Services</h1>
          {/* <p className="service-intro">
            We use only the best quality materials on the market in
            order to provide the best products to our patients.
          </p> */}
        </div>
      </section>

      <section className="services-grid">
        <div className="container">
          <div className="service-cards">
            {services.map((service) => {
              return (
                <div key={service.id} className="service-card">
                  <div className="service-icon">
                    {service.icon ? (
                      <img src={service.icon} alt={service.title} />
                    ) : (
                      <div className="service-icon-placeholder">
                        {service.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  {/* <Link to={service.link} className="learn-more">Learn More</Link> */}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="specialists-section">
        <div className="container">
          <h2>Meet Our Specialists</h2>
          
          {loading ? (
            <div className="loading-spinner">Loading specialists...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : specialists.length === 0 ? (
            <div className="no-specialists">No specialists currently available.</div>
          ) : (
            <div className="specialists-grid">
              {specialists.map((specialist) => {
                const profileImage =
                  specialist.user.profile_picture_url !== "none" &&
                  specialist.user.profile_picture_url !== "pending"
                    ? `${API_BASE_URL}${specialist.user.profile_picture_url}`
                    : null;
                const specialistFullName = `${specialist.user.first_name} ${specialist.user.last_name}`;
                return (
                  <div key={specialist.user.id} className="specialist-card">
                    <div className="specialist-image">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={`${specialist.user.first_name} ${specialist.user.last_name}`}
                        />
                      ) : (
                        <div className="specialist-image-placeholder">
                          {specialistFullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {specialist.user.linkedin && (
                        <a
                          href={specialist.user.linkedin}
                          className="linkedin-icon"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className="fab fa-linkedin"></i>
                        </a>
                      )}
                    </div>
                    <div className="specialist-info">
                      <h3>{specialist.user.first_name} {specialist.user.last_name}</h3>
                      <p>{specialist.specialization || "General Dentist"}</p>
                      {specialist.qualification && (
                        <p className="qualification">{specialist.qualification}</p>
                      )}
                      {specialist.experience && (
                        <p className="experience">{specialist.experience} years experience</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;