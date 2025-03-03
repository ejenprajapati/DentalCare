
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ServicesPage from './pages/ServicesPage';
import BlogsPage from './pages/BlogsPage';
import AppointmentPage from './pages/AppointmentPage';
// import AboutPage from './pages/AboutPage';
// import ContactPage from './pages/ContactPage';
import './App.css';

function App() {
  return (
    
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/appointment" element={<AppointmentPage />} />
            {/* <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} /> */}
          </Routes>
        </main>
        <Footer />
      </div>

  );
}

export default App;
