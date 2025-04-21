// DentistAppointments.tsx
import React, { useState } from 'react';
import AppointmentCalendar from '../components/AppointmentCalendar';


interface TreatmentCategory {
  name: string;
  color: string;
}
const API_BASE_URL = 'http://127.0.0.1:8000';
const AppointmentsPage: React.FC = () => {
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  
  const treatmentCategories: TreatmentCategory[] = [
    { name: 'Root Canal', color: '#636AF2' },
    { name: 'Consultation', color: '#F29D63' },
    { name: 'Wisdom Teeth Removal', color: '#63F2C2' },
    { name: 'Scaling', color: '#F26363' },
    { name: 'Bleaching', color: '#AE63F2' },
    { name: 'Check-up', color: '#F2DE63' },
    { name: 'Filling', color: '#63F2A0' },
  ];

  return (
    <div className="appointments-page">
      <div className="page-header">
        <h1>Appointments</h1>
        <button 
          className="add-appointment-button"
          onClick={() => setShowAddAppointment(true)}
        >
          + Add Appointment
        </button>
      </div>

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
        <AppointmentCalendar />
      </div>

      {showAddAppointment && (
        <div className="modal-overlay">
          <div className="add-appointment-modal">
            <div className="modal-header">
              <h2>Add New Appointment</h2>
              <button 
                className="close-button"
                onClick={() => setShowAddAppointment(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form className="appointment-form">
                <div className="form-group">
                  <label htmlFor="patient">Patient</label>
                  <select id="patient" name="patient" required>
                    <option value="">Select Patient</option>
                    {/* Patient options would be fetched from API */}
                  </select>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input type="date" id="date" name="date" required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="treatment">Treatment Type</label>
                    <select id="treatment" name="treatment" required>
                      <option value="">Select Type</option>
                      {treatmentCategories.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startTime">Start Time</label>
                    <input type="time" id="startTime" name="start_time" required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="endTime">End Time</label>
                    <input type="time" id="endTime" name="end_time" required />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="details">Details</label>
                  <textarea id="details" name="detail" rows={3}></textarea>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={() => setShowAddAppointment(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    Save Appointment
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

export default AppointmentsPage;