import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/PatientSignup';
import DentistSignup from './pages/DentistSignup';
import ServicesPage from './pages/ServicesPage';
import ProfilePage from './pages/ProfilePage';
import AppointmentPage from './pages/AppointmentPage';
import DentistAppointment from './pages/DentistAppointment';
import NotFound from "./pages/NotFound";
import AICheckup from './pages/AICheckup';
import Results from './pages/Results';
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Patient from "./pages/PatientsPage";
import PatientAppointment from "./pages/PatientAppointment";
import AnalysisHistory from './pages/AnalysisHistory';
import MyAppointments from './pages/MyAppointments';
import './App.css';

function Logout() {
  localStorage.clear();
  return <Navigate to="/" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Navigate to="/login" />;
  
}

function App() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage for user role
    const token = localStorage.getItem('access');
    if (token) {
      try {
        // Parse user info from token or fetch from API
        const userInfo = JSON.parse(atob(token.split('.')[1]));
        setUserRole(userInfo.role || null);
      } catch (error) {
        console.error('Error parsing token:', error);
        setUserRole(null);
      }
    }
  }, []);

  return (
    <div className="app-container">
      {userRole === 'dentist' ? (
        <Sidebar userRole={userRole} />
      ) : (
        <Header />
      )}
      
      <div className={`main-content ${userRole === 'dentist' ? 'with-sidebar' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dentist-signup" element={<DentistSignup />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register-and-logout" element={<RegisterAndLogout />} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
           <Route path="/my-appointments" element={
            <ProtectedRoute>
              <PatientAppointment />
            </ProtectedRoute>
          } />
          <Route path="/patient-appointments" element={
            <ProtectedRoute>
              <MyAppointments />
            </ProtectedRoute>
          } />
          
          <Route path="/appointment" element={
            <ProtectedRoute>
              <AppointmentPage />
            </ProtectedRoute>
          } />
          
          <Route path="/dentist-appointment" element={
            <ProtectedRoute>
              <DentistAppointment />
            </ProtectedRoute>
          } />
          
          <Route path="/ai-checkup" element={
            <ProtectedRoute>
              <AICheckup />
            </ProtectedRoute>
          } />
          
          <Route path="/results" element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/patients" element={
            <ProtectedRoute>
              <Patient />
            </ProtectedRoute>
          } />
          
          <Route path="/analysis-history" element={
            <ProtectedRoute>
              <AnalysisHistory />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      
      <Footer />
    </div>
  );
}

export default App;