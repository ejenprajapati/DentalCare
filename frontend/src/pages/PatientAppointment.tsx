// PatientAppointments.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import AppointmentCalendar from '../components/AppointmentCalendar';
import axios from 'axios';
import '../components/PatientAppointments.css';
const API_BASE_URL = 'http://127.0.0.1:8000';

interface TreatmentCategory {
  name: string;
  color: string;
}


const PatientAppointmentsPage: React.FC = () => {
  const [showRequestAppointment, setShowRequestAppointment] = useState(false);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const treatmentCategories: TreatmentCategory[] = [
    { name: 'Root Canal', color: '#636AF2' },
    { name: 'Consultation', color: '#F29D63' },
    { name: 'Wisdom Teeth Removal', color: '#63F2C2' },
    { name: 'Scaling', color: '#F26363' },
    { name: 'Bleaching', color: '#AE63F2' },
    { name: 'Check-up', color: '#F2DE63' },
    { name: 'Filling', color: '#63F2A0' },
  ];

  useEffect(() => {
    // Get the patient ID from the authenticated user profile
    fetchPatientProfile();
  }, []);

  useEffect(() => {
    // Only fetch appointments if we have a patient ID
    if (patientId) {
      fetchUpcomingAppointments();
    }
  }, [patientId]);

  const fetchPatientProfile = async () => {
    try {
      const token = localStorage.getItem('access');
      
      if (!token) {
        console.error('No access token found. User may not be authenticated.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/patient-profile/`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      
      setPatientId(response.data.id);
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      setLoading(false);
    }
  };

  const fetchUpcomingAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      
      if (!token) {
        console.error('No access token found.');
        setLoading(false);
        return;
      }
      
      const today = new Date().toISOString().split('T')[0];
      
      const response = await axios.get(`${API_BASE_URL}/api/appointments/`, {
        params: {
          patient: patientId,
          start_date: today,
        },
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      
      // Sort appointments by date and time
      const sortedAppointments = response.data.sort((a: any, b: any) => {
        const dateA = new Date(`${a.date}T${a.start_time}`);
        const dateB = new Date(`${b.date}T${b.start_time}`);
        return dateA.getTime() - dateB.getTime();
      });
      
      // Take only the next few appointments
      setUpcomingAppointments(sortedAppointments.slice(0, 3));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  return (
    <div className="patient-appointments-page">
     

      <div className="appointments-dashboard">
        <div className="upcoming-appointments">
          <h2>Upcoming Appointments</h2>
          {loading ? (
            <p>Loading your appointments...</p>
          ) : upcomingAppointments.length > 0 ? (
            <div className="appointment-cards">
              {upcomingAppointments.map((appointment) => {
                const treatmentType = 
                  appointment.detail?.toLowerCase().includes('root canal') ? 'Root Canal' :
                  appointment.detail?.toLowerCase().includes('consult') ? 'Consultation' :
                  appointment.detail?.toLowerCase().includes('wisdom') ? 'Wisdom Teeth Removal' :
                  appointment.detail?.toLowerCase().includes('scaling') ? 'Scaling' :
                  appointment.detail?.toLowerCase().includes('bleach') ? 'Bleaching' :
                  appointment.detail?.toLowerCase().includes('check') ? 'Check-up' :
                  appointment.detail?.toLowerCase().includes('fill') ? 'Filling' : 'Regular';
                
                const treatmentColor = treatmentCategories.find(c => c.name === treatmentType)?.color || '#63A4F2';
                
                return (
                  <div key={appointment.id} className="appointment-card">
                    <div className="card-header" style={{ backgroundColor: treatmentColor }}>
                      <h3>{treatmentType}</h3>
                      <span className={`status ${appointment.approved ? 'confirmed' : 'pending'}`}>
                        {appointment.approved ? 'Confirmed' : 'Pending Confirmation'}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="appointment-detail">
                        <Calendar size={16} />
                        <span>{new Date(appointment.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="appointment-detail">
                        <Clock size={16} />
                        <span>{appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}</span>
                      </div>
                      <div className="appointment-detail">
                        <AlertCircle size={16} />
                        <span>Dr. {appointment.dentist_name || 'Assigned Dentist'}</span>
                      </div>
                      {appointment.detail && (
                        <div className="appointment-notes">
                          <p>{appointment.detail}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-appointments">You don't have any upcoming appointments.</p>
          )}
        </div>
      </div>

      <div className="calendar-section">
        
        <div className="legend">
          <div className="legend-title">Treatment Types:</div>
          <div className="legend-items">
            {treatmentCategories.map((category) => (
              <div key={category.name} className="legend-item">
                <div 
                  className="color-indicator"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span>{category.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="calendar-wrapper">
          {/* Pass patient ID prop to filter appointments for this patient only */}
          <AppointmentCalendar patientId={patientId} readOnly={true} />
        </div>
      </div>

      {showRequestAppointment && (
        <div className="modal-overlay">
          <div className="request-appointment-modal">
            <div className="modal-header">
              <h2>Request New Appointment</h2>
              <button 
                className="close-button"
                onClick={() => setShowRequestAppointment(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form className="appointment-form">
                <div className="form-group">
                  <label htmlFor="treatmentType">Treatment Type</label>
                  <select id="treatmentType" name="treatment_type" required>
                    <option value="">Select Treatment Type</option>
                    {treatmentCategories.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="preferredDate">Preferred Date</label>
                    <input type="date" id="preferredDate" name="preferred_date" required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="preferredTime">Preferred Time</label>
                    <select id="preferredTime" name="preferred_time" required>
                      <option value="">Select Time</option>
                      <option value="morning">Morning (9AM - 12PM)</option>
                      <option value="afternoon">Afternoon (1PM - 5PM)</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="alternateDate">Alternate Date (Optional)</label>
                  <input type="date" id="alternateDate" name="alternate_date" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea id="notes" name="notes" rows={3} placeholder="Please provide any details about your request"></textarea>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={() => setShowRequestAppointment(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-button">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointmentsPage;