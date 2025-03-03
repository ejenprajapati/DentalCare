// pages/ServicesPage.js

import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

function ServicesPage() {
  const services = [
    {
      id: 1,
      icon: "/icons/root-canal.svg",
      title: "Root Canal Treatment",
      description: "Root canal treatment (endodontics) is a dental procedure used to treat infection at the centre of a tooth.",
      link: "/services/root-canal"
    },
    {
      id: 2,
      icon: "/icons/cosmetic.svg",
      title: "Cosmetic Dentist",
      description: "Cosmetic dentistry is the branch of dentistry that focuses on improving the appearance of your smile.",
      link: "/services/cosmetic"
    },
    {
      id: 3,
      icon: "/icons/implants.svg",
      title: "Dental Implants",
      description: "A dental implant is an artificial tooth root that's placed into your jaw to hold a prosthetic tooth or bridge.",
      link: "/services/implants"
    },
    {
      id: 4,
      icon: "/icons/whitening.svg",
      title: "Teeth Whitening",
      description: "It's never been easier to brighten your smile at home. There are all kinds of products you can try.",
      link: "/services/whitening"
    },
    {
      id: 5,
      icon: "/icons/emergency.svg",
      title: "Emergency Dentistry",
      description: "In general, any dental problem that needs immediate treatment to stop bleeding, alleviate severe pain.",
      link: "/services/emergency"
    },
    {
      id: 6,
      icon: "/icons/prevention.svg",
      title: "Prevention",
      description: "Preventive dentistry is dental care that helps maintain good oral health. a combination of regular dental.",
      link: "/services/prevention"
    }
  ];

  const specialists = [
    {
      id: 1,
      name: "Dentist 1",
      specialty: "Orthodontist",
      image: "/images/dentist1.jpg"
    },
    {
      id: 2,
      name: "Dentist 1",
      specialty: "Orthodontist",
      image: "/images/dentist2.jpg"
    },
    {
      id: 3,
      name: "Dentist 1",
      specialty: "Orthodontist",
      image: "/images/dentist3.jpg"
    },
    {
      id: 4,
      name: "Dentist 1",
      specialty: "Orthodontist",
      image: "/images/dentist4.jpg"
    }
  ];

  return (
    <div className="services-page">
      <section className="page-hero">
        <div className="container">
          <h1>Services</h1>
          <p className="service-intro">
            We use only the best quality materials on the market in
            order to provide the best products to our patients.
          </p>
        </div>
      </section>

      <section className="services-grid">
        <div className="container">
          <div className="service-cards">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-icon">
                  <img src={logo} alt={service.title} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to={service.link} className="learn-more">Learn More</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="specialists-section">
        <div className="container">
          <h2>Meet Our Specialists</h2>
          <div className="specialists-slider">
            {specialists.map(specialist => (
              <div key={specialist.id} className="specialist-card">
                <div className="specialist-image">
                  <img src={specialist.image} alt={specialist.name} />
                  <a href="#" className="linkedin-icon">
                    <i className="fab fa-linkedin"></i>
                  </a>
                </div>
                <div className="specialist-info">
                  <h3>{specialist.name}</h3>
                  <p>{specialist.specialty}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="slider-controls">
            <button className="prev-btn">
              <i className="fas fa-arrow-left"></i>
            </button>
            <button className="next-btn">
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ServicesPage;