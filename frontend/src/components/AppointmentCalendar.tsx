// AppointmentCalendar.tsx
import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isToday, isSameDay, getDay } from 'date-fns';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  RefreshCw, 
  Printer, 
  Filter, 
  Clock, 
  X, 
  MoreVertical, 
  Edit
} from 'lucide-react';
import axios from 'axios';


interface Appointment {
  id: number;
  detail: string;
  date: string;
  start_time: string;
  end_time: string;
  approved: boolean;
  patient: number;
  dentist: number;
  patient_name: string;
  dentist_name: string;
}

interface AppointmentWithPosition extends Appointment {
  top: number;
  height: number;
  left: number;
}

interface CalendarSettings {
  view: 'day' | 'week' | 'month';
  startHour: number;
  endHour: number;
}

const timeSlots = Array.from({ length: 10 }, (_, i) => 9 + i);
const API_BASE_URL = 'http://127.0.0.1:8000';

const treatmentColors = {
  'Root Canal': '#636AF2',
  'Consultation': '#F29D63',
  'Wisdom Teeth Removal': '#63F2C2',
  'Scaling': '#F26363',
  'Bleaching': '#AE63F2',
  'Check-up': '#F2DE63',
  'Filling': '#63F2A0',
  'Regular': '#63A4F2',
};

// Helper function to extract treatment type from appointment detail
const getTreatmentType = (detail: string): string => {
  if (!detail) return 'Regular';
  
  const lowerDetail = detail.toLowerCase();
  if (lowerDetail.includes('root canal')) return 'Root Canal';
  if (lowerDetail.includes('consult')) return 'Consultation';
  if (lowerDetail.includes('wisdom')) return 'Wisdom Teeth Removal';
  if (lowerDetail.includes('scaling')) return 'Scaling';
  if (lowerDetail.includes('bleach')) return 'Bleaching';
  if (lowerDetail.includes('check')) return 'Check-up';
  if (lowerDetail.includes('fill')) return 'Filling';
  
  return 'Regular';
};

// Convert time string to decimal hours (e.g., "09:30" -> 9.5)
const timeToDecimal = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours + minutes / 60;
};

const AppointmentCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithPosition[]>([]);
  const [settings, setSettings] = useState<CalendarSettings>({
    view: 'week',
    startHour: 9,
    endHour: 17,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [activeAppointment, setActiveAppointment] = useState<AppointmentWithPosition | null>(null);

  // Generate dates for the week view
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Format date range for API query
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(addDays(startDate, 6), 'yyyy-MM-dd');
      
      console.log(`Fetching appointments from ${startDateStr} to ${endDateStr}`);
      
      // Get the access token from local storage
      const token = localStorage.getItem('access');
      
      if (!token) {
        console.error('No access token found. User may not be authenticated.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/appointments/`, {
        params: {
          start_date: startDateStr,
          end_date: endDateStr,
        },
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      
      console.log('API Response:', response.data);
      
      if (response.data.length === 0) {
        console.log('No appointments found for this date range');
      }
  
      // Calculate position for each appointment
      const positionedAppointments = response.data.map((appt: Appointment) => {
        const apptDate = new Date(appt.date);
        const dayIndex = getDay(apptDate) - 1; // Convert to 0-6 (Mon-Sun), adjust for Monday start
        const dayIndexAdjusted = dayIndex < 0 ? 6 : dayIndex; // Fix for Sunday
        
        const startDecimal = timeToDecimal(appt.start_time);
        const endDecimal = timeToDecimal(appt.end_time);
        
        const top = (startDecimal - settings.startHour) * 60; // 60px per hour
        const height = (endDecimal - startDecimal) * 60;
        const left = (dayIndexAdjusted * 100) / 7; // Each day takes 1/7 of width
        
        return {
          ...appt,
          top,
          height,
          left,
        };
      });
  
      console.log('Positioned appointments:', positionedAppointments);
      setAppointments(positionedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // More detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data);
        console.error('Status:', error.response?.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'prev' ? -7 : 7;
    setCurrentDate(prevDate => addDays(prevDate, days));
  };

  const showAppointmentDetails = (appointment: AppointmentWithPosition) => {
    setActiveAppointment(appointment);
  };

  const hideAppointmentDetails = () => {
    setActiveAppointment(null);
  };

  const getAppointmentClassName = (appointment: AppointmentWithPosition) => {
    const treatmentType = getTreatmentType(appointment.detail);
    return `appointment ${treatmentType.toLowerCase().replace(/\s+/g, '-')}`;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="date-navigation">
          <button onClick={() => navigateWeek('prev')} className="nav-button">
            <ChevronLeft size={18} />
          </button>
          <span className="date-range">
            {format(startDate, 'MMMM dd')} - {format(addDays(startDate, 6), 'MMMM dd, yyyy')}
          </span>
          <button onClick={() => navigateWeek('next')} className="nav-button">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="calendar-actions">
          <button className="action-button view-button">
            <Calendar size={18} />
          </button>
          <button className="action-button refresh-button" onClick={fetchAppointments}>
            <RefreshCw size={18} />
          </button>
          <button className="action-button print-button">
            <Printer size={18} />
          </button>
          <button className="action-button filter-button">
            <Filter size={18} />
            <span>Filters</span>
          </button>
          <button className="action-button settings-button">
            <Settings size={18} />
            <span>Calendar Settings</span>
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="time-column">
          <div className="day-header"></div>
          {timeSlots.map(hour => (
            <div key={hour} className="time-slot">
              <span className="time-label">{hour}:00</span>
            </div>
          ))}
        </div>

        <div className="days-container">
          <div className="day-headers">
            {dates.map((date, index) => (
              <div 
                key={index} 
                className={`day-header ${isToday(date) ? 'today' : ''}`}
              >
                <div className="day-name">{format(date, 'EEE')}</div>
                <div className="day-number">{format(date, 'dd')}</div>
              </div>
            ))}
          </div>

          <div className="time-grid">
            {dates.map((date, dayIndex) => (
              <div key={dayIndex} className="day-column">
                {timeSlots.map(hour => (
                  <div key={`${dayIndex}-${hour}`} className="time-cell"></div>
                ))}
                
                {/* Render appointments for this day */}
                {appointments
                  .filter(appt => isSameDay(new Date(appt.date), date))
                  .map(appointment => (
                    <div
                      key={appointment.id}
                      className={getAppointmentClassName(appointment)}
                      style={{
                        top: `${appointment.top}px`,
                        height: `${appointment.height}px`,
                        backgroundColor: treatmentColors[getTreatmentType(appointment.detail) as keyof typeof treatmentColors]
                      }}
                      onClick={() => showAppointmentDetails(appointment)}
                    >
                      <div className="appt-time">
                        {appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}
                      </div>
                      <div className="appt-patient">{appointment.patient_name}</div>
                      <div className="appt-type">{getTreatmentType(appointment.detail)}</div>
                    </div>
                  ))
                }
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current time indicator */}
      <div className="current-time-indicator" style={{ top: `${(timeToDecimal(format(new Date(), 'HH:mm')) - settings.startHour) * 60}px` }}>
        <div className="time-dot"></div>
        <div className="time-line"></div>
      </div>

      {/* Appointment details modal */}
      {activeAppointment && (
        <div className="appointment-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{getTreatmentType(activeAppointment.detail)}</h3>
              <div className="modal-actions">
                <button className="modal-action-button">
                  <Edit size={16} />
                </button>
                <button className="modal-action-button">
                  <MoreVertical size={16} />
                </button>
                <button className="modal-close" onClick={hideAppointmentDetails}>
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <Clock size={16} />
                <span>
                  {format(new Date(activeAppointment.date), 'MMMM dd, yyyy')} |{' '}
                  {activeAppointment.start_time.substring(0, 5)} - {activeAppointment.end_time.substring(0, 5)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Patient:</span>
                <span>{activeAppointment.patient_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`status ${activeAppointment.approved ? 'approved' : 'pending'}`}>
                  {activeAppointment.approved ? 'Confirmed' : 'Pending'}
                </span>
              </div>
              {activeAppointment.detail && (
                <div className="detail-row">
                  <span className="detail-label">Notes:</span>
                  <p>{activeAppointment.detail}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && <div className="loading-overlay">Loading appointments...</div>}
    </div>
  );
};

export default AppointmentCalendar;