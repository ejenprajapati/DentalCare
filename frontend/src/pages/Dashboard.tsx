import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import defaultPic from '../assets/default.jpg';
import userLogo from '../assets/user.png';
import appointmentLogo from '../assets/appointment-logo.png';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface AppointmentData {
  id: number;
  patient_name: string;
  patient_id: number;
  time: string;
  status: string;
  gender: string;
  date: string;
  detail: string;
  approved: boolean;
}

interface PatientData {
  id: number;
  name: string;
  visit_id: string;
  date: string;
  gender: string;
}

interface GenderDistribution {
  male: number;
  female: number;
  child: number;
}

interface DashboardStats {
  total_appointments: number;
  new_patients_count: number;
  total_patients: number;
  appointments: AppointmentData[];
  recent_patients: PatientData[];
  gender_distribution: GenderDistribution;
  dentist_name?: string;
}

const statusOptions = ['Approved', 'Declined'];

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<string>("2025");
  const [dentistName, setDentistName] = useState<string>("");
  const [processingAppointment, setProcessingAppointment] = useState<number | null>(null);
  const [editingStatus, setEditingStatus] = useState<number | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access');
      
      // Fetch user profile to get the dentist's name
      const userResponse = await axios.get(`${API_BASE_URL}/api/user/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const firstName = userResponse.data.first_name || '';
      const lastName = userResponse.data.last_name || '';
      const fullName = (firstName || lastName) ? `Dr. ${firstName} ${lastName}`.trim() : 'Dr. Dentist';
      setDentistName(fullName);
      
      // Fetch dashboard stats
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Handle appointment approval with local state update
  const handleAppointmentAction = async (appointmentId: number, approved: boolean) => {
    try {
      setProcessingAppointment(appointmentId);
      const token = localStorage.getItem('access');
      
      // Optimistically update the local state
      setStats((prevStats) => {
        if (!prevStats) return prevStats;
        return {
          ...prevStats,
          appointments: prevStats.appointments.map((appt) =>
            appt.id === appointmentId
              ? { ...appt, approved, status: approved ? 'Approved' : 'Declined' }
              : appt
          ),
        };
      });

      // Update the database
      await axios.patch(
        `${API_BASE_URL}/api/appointments/${appointmentId}/`,
        { approved },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Refresh the dashboard data to ensure consistency
      await fetchDashboardStats();
      
    } catch (err) {
      console.error('Error updating appointment:', err);
      // Revert optimistic update on error
      await fetchDashboardStats();
      alert('Failed to update appointment status. Please try again.');
    } finally {
      setProcessingAppointment(null);
    }
  };

  // Render status control with correct status display
  const renderStatusControl = (appointment: AppointmentData) => {
    const isEditing = editingStatus === appointment.id;
    const statusText = appointment.status;

    return (
      <div className="status-control">
        <div className="status-display">
          <span className={`appointment-status ${appointment.approved ? 'confirmed' : 'declined'}`}>
            {statusText}
          </span>
          {processingAppointment === appointment.id ? (
            <span className="processing-indicator">Processing...</span>
          ) : (
            <button
              className="edit-status-btn"
              onClick={() => setEditingStatus(isEditing ? null : appointment.id)}
            >
              Edit
            </button>
          )}
        </div>

        {isEditing && (
          <div className="status-dropdown">
            {statusOptions.map((option) => (
              <div key={option} className="status-option">
                <button
                  className={`option-btn ${option === statusText ? 'selected' : ''}`}
                  onClick={async () => {
                    const newApproved = option === 'Approved';
                    if (newApproved !== appointment.approved) {
                      await handleAppointmentAction(appointment.id, newApproved);
                    }
                    setEditingStatus(null);
                  }}
                >
                  {option}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Format data for pie chart
  const formatGenderData = (distribution: GenderDistribution | undefined) => {
    if (!distribution) return [];
    return [
      { name: 'Male', value: distribution.male },
      { name: 'Female', value: distribution.female },
      { name: 'Other', value: distribution.child }
    ];
  };

  const COLORS = ['#FFA500', '#8884d8', '#00C49F'];

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  // Calculate the number of returning patients safely
  const returningPatients = stats ? (stats.total_patients - (stats.new_patients_count || 0)) : 0;

  // Helper function to get appropriate gender display icon/class
  const getGenderIcon = (gender: string) => {
    const normalizedGender = gender?.toLowerCase();
    if (normalizedGender === 'male') return 'men';
    if (normalizedGender === 'female') return 'women';
    return 'men'; // Default fallback
  };

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h2>{dentistName}</h2>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card purple">
          <div className="stat-icon">
            <img src={appointmentLogo}alt="phone" style={{ width: '70px', height: '70px' }} />
          </div>
          <div className="stat-content">
            <h3>{stats?.total_appointments || '0'}</h3>
            <p>Appointments</p>
          </div>
        </div>
        
        <div className="stat-card pink">
          <div className="stat-icon">
          <img src={userLogo}alt="patient" style={{ width: '68px', height: '68px' }} />
          </div>
          <div className="stat-content">
            <h3>{stats?.total_patients || '0'}</h3>
            <p>Total Patients</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Appointment Requests</h3>
            <a href="/patients" className="view-all">View All</a>
          </div>
          <div className="appointment-list">
            {stats?.appointments && stats.appointments.length > 0 ? (
              stats.appointments.map((appointment) => (
                <div className="appointment-item" key={appointment.id}>
                  <div className="appointment-avatar">
                    <img src={defaultPic} alt={appointment.patient_name} />
                  </div>
                  <div className="appointment-details">
                    <h4>{appointment.patient_name}</h4>
                    <p>{appointment.gender}, {appointment.date}, {appointment.time}</p>
                    {appointment.detail && (
                      <p className="appointment-reason">Reason: {appointment.detail}</p>
                    )}
                  </div>
                  <div className="appointment-actions">
                    {renderStatusControl(appointment)}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-appointments">No appointments scheduled</div>
            )}
          </div>
        </div>

        <div className="dashboard-analytics">
          <div className="patients-section">
            <div className="section-header">
              <h3>Patients</h3>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
            <div className="patient-stats">
              <div className="patient-stat-item">
                <div className="patient-icon">
                <img src={userLogo}alt="phone" style={{ width: '50px', height: '50px' }} />
                </div>
                <div className="patient-stat-details">
                  <h4>{stats?.new_patients_count || '0'}</h4>
                  <p>New Patients</p>
                </div>
                <div className="stat-change positive">↑</div>
              </div>
             
            </div>
          </div>

          <div className="gender-section">
            <div className="section-header">
              <h3>Gender</h3>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
            <div className="gender-chart">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={formatGenderData(stats?.gender_distribution)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                  >
                    {formatGenderData(stats?.gender_distribution).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-patients-section">
        <h3>Recent Patients</h3>
        <table className="recent-patients-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Visit ID</th>
              <th>Date</th>
              <th>Gender</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recent_patients && stats.recent_patients.length > 0 ? (
              stats.recent_patients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="patient-name-cell">
                      <img src={defaultPic} alt={patient.name} />
                      <span>{patient.name}</span>
                    </div>
                  </td>
                  <td>{patient.visit_id}</td>
                  <td>{patient.date}</td>
                  <td>{patient.gender}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No recent patients</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Dashboard;