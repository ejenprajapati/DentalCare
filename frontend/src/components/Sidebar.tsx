import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { FaHome, FaCalendarAlt, FaUserFriends, FaChartLine, FaCog, FaSignOutAlt } from 'react-icons/fa';

interface SidebarProps {
  userRole: string;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const location = useLocation();
  
  // Only show sidebar for dentist users
  if (userRole !== 'dentist') {
    return null;
  }

  const menuItems = [
    { path: '/dashboard', icon: <FaChartLine />, label: 'Dashboard' },
    { path: '/appointments', icon: <FaCalendarAlt />, label: 'Appointments' },
    { path: '/patients', icon: <FaUserFriends />, label: 'Patients' },
    { path: '/settings', icon: <FaCog />, label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img src="/logo.png" alt="Dental Care" />
          <h2>Dental Care</h2>
        </div>
      </div>
      
      <div className="sidebar-user">
        <div className="user-avatar">
          <img src="/api/placeholder/40/40" alt="User Avatar" />
        </div>
        <div className="user-info">
          <h3>Dr. Dentist</h3>
          <span>Dentist</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <Link to="/logout" className="logout-btn">
          <span className="icon"><FaSignOutAlt /></span>
          <span className="label">Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;