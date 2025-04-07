import React, { useState, useEffect } from 'react';
import { FaUsers, FaCalendarAlt, FaTooth, FaChartLine } from 'react-icons/fa';
import '../styles/Dashboard.css';

interface DashboardStats {
  totalPatients: number;
  upcomingAppointments: number;
  pendingDiagnosis: number;
  completedTreatments: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  time: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    upcomingAppointments: 0,
    pendingDiagnosis: 0,
    completedTreatments: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setStats({
        totalPatients: 48,
        upcomingAppointments: 12,
        pendingDiagnosis: 7,
        completedTreatments: 35
      });
      
      setRecentActivity([
        { id: 1, type: 'appointment', description: 'New appointment with Olga Guardado', time: '2 hours ago' },
        { id: 2, type: 'diagnosis', description: 'Diagnosed Cavity for Herman Smith', time: '3 hours ago' },
        { id: 3, type: 'treatment', description: 'Completed Root Canal for Dimas Rodriguez', time: '5 hours ago' },
        { id: 4, type: 'diagnosis', description: 'Analyzed image for Hendri Jones', time: 'Yesterday' },
        { id: 5, type: 'appointment', description: 'Rescheduled appointment with Danu Lee', time: 'Yesterday' }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <FaCalendarAlt className="activity-icon appointment" />;
      case 'diagnosis':
        return <FaTooth className="activity-icon diagnosis" />;
      case 'treatment':
        return <FaChartLine className="activity-icon treatment" />;
      default:
        return <FaUsers className="activity-icon" />;
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon patients">
            <FaUsers />
          </div>
          <div className="stat-details">
            <h3>Total Patients</h3>
            <p className="stat-number">{stats.totalPatients}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon appointments">
            <FaCalendarAlt />
          </div>
          <div className="stat-details">
            <h3>Upcoming Appointments</h3>
            <p className="stat-number">{stats.upcomingAppointments}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon diagnosis">
            <FaTooth />
          </div>
          <div className="stat-details">
            <h3>Pending Diagnosis</h3>
            <p className="stat-number">{stats.pendingDiagnosis}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon treatments">
            <FaChartLine />
          </div>
          <div className="stat-details">
            <h3>Completed Treatments</h3>
            <p className="stat-number">{stats.completedTreatments}</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div className="activity-item" key={activity.id}>
                {getActivityIcon(activity.type)}
                <div className="activity-details">
                  <p>{activity.description}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="btn btn-primary">New Appointment</button>
            <button className="btn btn-primary">Add Patient</button>
            <button className="btn btn-primary">Upload Image</button>
            <button className="btn btn-primary">View Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;