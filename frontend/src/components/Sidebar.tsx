import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src="/logo.png" alt="Dental Care" className="logo" />
        <span className="logo-text">DENTAL CARE</span>
      </div>
      
      <ul className="sidebar-menu">
        <li 
          className={activeSection === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveSection('dashboard')}
        >
          <i className="icon dashboard-icon"></i>
          <span>Dashboard</span>
        </li>
        <li 
          className={activeSection === 'appointments' ? 'active' : ''}
          onClick={() => setActiveSection('appointments')}
        >
          <i className="icon appointments-icon"></i>
          <span>Appointments</span>
        </li>
        <li 
          className={activeSection === 'patients' ? 'active' : ''}
          onClick={() => setActiveSection('patients')}
        >
          <i className="icon patients-icon"></i>
          <span>Patients</span>
        </li>
        <li 
          className={activeSection === 'settings' ? 'active' : ''}
          onClick={() => setActiveSection('settings')}
        >
          <i className="icon settings-icon"></i>
          <span>Settings</span>
        </li>
      </ul>
      
      <div className="dentist-profile">
        <div className="profile-avatar">
          <img src="/avatar-placeholder.png" alt="Dr." />
        </div>
        <div className="profile-info">
          <span className="dentist-name">Dr. Dentist</span>
          <i className="dropdown-icon"></i>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;