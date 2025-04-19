import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import appointment_img from '../assets/appointment-page.png';
import axios from 'axios';

interface Dentist {
  id?: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
  specialization: string;
}

interface Patient {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

interface AppointmentFormData {
  detail: string;
  customDetail: string;
  date: string;
  start_time: string;
  end_time: string;
  dentist: number;
  patient?: number;
  agreeToPrivacy: boolean;
}

interface UserProfile {
  id: number;
  role: string;
  patient?: {
    id: number;
  };
}

// Define common dental visit reasons
const VISIT_REASONS = [
  "Regular Checkup",
  "Teeth Cleaning",
  "Toothache",
  "Cavity/Filling",
  "Root Canal",
  "Crown/Bridge Work",
  "Dentures",
  "Implants",
  "Teeth Whitening",
  "Orthodontic Consultation",
  "Wisdom Teeth",
  "Gum Disease Treatment",
  "Emergency Visit",
  "Other"
];

// Define available time slots (9AM to 6PM)
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 9; hour <= 18; hour++) {
    // Add hour:00
    times.push(`${hour.toString().padStart(2, '0')}:00`);
    // Add hour:30 if not the last hour (6PM)
    if (hour < 18) {
      times.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

const API_BASE_URL = 'http://127.0.0.1:8000';

const AppointmentPage: React.FC = () => {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [availableEndTimes, setAvailableEndTimes] = useState<string[]>([]);

  const [formData, setFormData] = useState<AppointmentFormData>({
    detail: '',
    customDetail: '',
    date: '',
    start_time: '',
    end_time: '',
    dentist: 0,
    agreeToPrivacy: false,
  });

  // Effect to update available end times based on selected start time
  useEffect(() => {
    if (formData.start_time) {
      const startTimeIndex = TIME_OPTIONS.indexOf(formData.start_time);
      if (startTimeIndex !== -1 && startTimeIndex < TIME_OPTIONS.length - 1) {
        // Set available end times to be after the selected start time
        setAvailableEndTimes(TIME_OPTIONS.slice(startTimeIndex + 1));
        
        // Reset end time if it's now invalid
        if (formData.end_time && TIME_OPTIONS.indexOf(formData.end_time) <= startTimeIndex) {
          setFormData(prev => ({
            ...prev,
            end_time: ''
          }));
        }
      }
    } else {
      setAvailableEndTimes([]);
    }
  }, [formData.start_time]);

  const getAuthToken = () => {
    // Try to get token from localStorage
    const token = localStorage.getItem('access') || localStorage.getItem('token');
    
    // Debug token format
    if (token) {
      console.log('Token:', token);
    } else {
      console.warn('No authentication token found');
    }
    
    return token;
  };

  const getAuthHeader = () => {
    const token = getAuthToken();
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  };

  // Fetch user profile to determine role
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          console.warn('No token found for user profile fetch');
          return;
        }
        
        // Debug the auth header
        console.log('Auth header for profile:', `Bearer ${token}`);
        
        const response = await axios.get(`${API_BASE_URL}/api/user/profile/`, {
          headers: getAuthHeader()
        });
        
        console.log('User profile response:', response.data);
        setUserProfile(response.data);
        
        // If user is a patient, set the patient ID in the form data
        if (response.data.role === 'patient' && response.data.patient) {
          setFormData(prev => ({
            ...prev,
            patient: response.data.patient.id
          }));
        }
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        // Check for specific error types
        if (err.response && err.response.status === 403) {
          setError('Authentication error: Please check if you are logged in correctly');
        }
      }
    };
    
    fetchUserProfile();
  }, []);

  // Fetch dentists when component mounts
  useEffect(() => {
    const fetchDentists = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`${API_BASE_URL}/api/dentists/`, {
          headers: getAuthHeader()
        });
        
        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          setDentists(response.data);
        } else if (response.data && typeof response.data === 'object') {
          // If response.data is an object with a results property
          const dentistsArray = response.data.results || [];
          setDentists(Array.isArray(dentistsArray) ? dentistsArray : []);
        } else {
          setDentists([]);
          console.error('API response format unexpected:', response.data);
          setError('Received unexpected data format from server');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dentists:', err);
        setError('Failed to load dentists. Please try again later.');
        setLoading(false);
        setDentists([]);
      }
    };
    
    fetchDentists();
  }, []);

  // Fetch patients if user is a dentist
  useEffect(() => {
    if (userProfile?.role === 'dentist') {
      const fetchPatients = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/patients/`, {
            headers: getAuthHeader()
          });
          
          if (Array.isArray(response.data)) {
            setPatients(response.data);
          } else if (response.data && typeof response.data === 'object') {
            const patientsArray = response.data.results || [];
            setPatients(Array.isArray(patientsArray) ? patientsArray : []);
          } else {
            setPatients([]);
          }
        } catch (err) {
          console.error('Error fetching patients:', err);
        }
      };
      
      fetchPatients();
    }
  }, [userProfile]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Get the token - ensure it's the correct format
      const token = getAuthToken();
      
      if (!token) {
        setError('You must be logged in to schedule an appointment.');
        setLoading(false);
        return;
      }
      
      // Validate form
      if (!formData.dentist || formData.dentist === 0) {
        setError('Please select a doctor');
        setLoading(false);
        return;
      }
      
      // Validate times - ensure end time is after start time
      if (!formData.start_time || !formData.end_time) {
        setError('Please select both start and end times.');
        setLoading(false);
        return;
      }
      
      const startTimeIndex = TIME_OPTIONS.indexOf(formData.start_time);
      const endTimeIndex = TIME_OPTIONS.indexOf(formData.end_time);
      
      if (startTimeIndex >= endTimeIndex) {
        setError('End time must be after start time.');
        setLoading(false);
        return;
      }
      
      // For "Other" reason, use the customDetail field
      const finalDetail = formData.detail === 'Other' 
        ? formData.customDetail
        : formData.detail;
        
      if (formData.detail === 'Other' && !formData.customDetail.trim()) {
        setError('Please specify the reason for your visit.');
        setLoading(false);
        return;
      }
      
      // Create appointment data object
      const appointmentData: any = {
        detail: finalDetail,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        dentist: Number(formData.dentist)
      };
      
      // Add patient ID if user is a dentist making an appointment for a patient
      if (userProfile?.role === 'dentist' && formData.patient) {
        appointmentData.patient = Number(formData.patient);
      } else if (userProfile?.role === 'patient' && userProfile.patient) {
        // Explicitly include patient ID even if the backend can infer it
        appointmentData.patient = userProfile.patient.id;
      }

      console.log('Submitting appointment data:', appointmentData);
      console.log('Auth headers:', getAuthHeader());

      // Submit the appointment request
      const response = await axios.post(
        `${API_BASE_URL}/api/appointments/`, 
        appointmentData, 
        {
          headers: getAuthHeader()
        }
      );

      console.log('Appointment response:', response.data);
      setSuccessMessage('Appointment scheduled successfully!');
      
      // Reset form
      setFormData({
        detail: '',
        customDetail: '',
        date: '',
        start_time: '',
        end_time: '',
        dentist: 0,
        agreeToPrivacy: false,
      });

    } catch (err: any) {
      console.error('Error scheduling appointment:', err);
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response error data:', err.response.data);
        console.error('Response error status:', err.response.status);
        
        if (err.response.status === 403) {
          setError('Permission denied. Please check if you are logged in with the correct account type.');
        } else if (err.response.status === 401) {
          setError('Authentication error: Your session may have expired. Please log in again.');
        } else if (err.response.data && typeof err.response.data === 'object') {
          // Try to get error message from response
          const errorMessage = Object.values(err.response.data)
            .flat()
            .join(' ');
          setError(errorMessage || 'An error occurred while scheduling your appointment.');
        } else {
          setError('An error occurred while scheduling your appointment.');
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An error occurred while preparing your request.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-page">
      <div className="container">
        <div className="appointment-hero">
          <div className="appointment-image">
            <img src={appointment_img} alt="Happy dental patient" />
          </div>
          
          <div className="appointment-form-container">
            <div className="appointment-title">
              <h1>MAKE AN <span>APPOINTMENT</span></h1>
              <h2>Consult with our Doctor</h2>
            </div>
            
            {!getAuthToken() && (
              <div className="error-message">
                You need to login before making an appointment.
              </div>
            )}
            
            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <form className="appointment-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    className="form-control" 
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time (9AM-5:30PM)</label>
                  <select 
                    name="start_time" 
                    className="form-control"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Start Time</option>
                    {TIME_OPTIONS.slice(0, -1).map((time) => (
                      <option key={`start-${time}`} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>End Time (until 6PM)</label>
                  <select 
                    name="end_time" 
                    className="form-control"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                    disabled={!formData.start_time}
                  >
                    <option value="">Select End Time</option>
                    {availableEndTimes.map((time) => (
                      <option key={`end-${time}`} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Show patient select for dentists */}
              {userProfile?.role === 'dentist' && (
                <div className="form-group">
                  <label>Patient</label>
                  <select 
                    name="patient" 
                    className="form-control"
                    value={formData.patient}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.user.first_name} {patient.user.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="form-group">
                <label>Doctor</label>
                <select 
                  name="dentist" 
                  className="form-control"
                  value={formData.dentist}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Doctor</option>
                  {loading ? (
                    <option value="" disabled>Loading dentists...</option>
                  ) : (
                    Array.isArray(dentists) && dentists.length > 0 ? (
                      dentists.map((dentist) => (
                        <option key={dentist.user.id} value={dentist.id || dentist.user.id}>
                          Dr. {dentist.user.first_name} {dentist.user.last_name} 
                          {dentist.specialization ? ` - ${dentist.specialization}` : ''}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No doctors available</option>
                    )
                  )}
                </select>
              </div>
              
              <div className="form-group">
                <label>Reason for Visit</label>
                <select 
                  name="detail" 
                  className="form-control"
                  value={formData.detail}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a reason</option>
                  {VISIT_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Show custom reason text field only when "Other" is selected */}
              {formData.detail === 'Other' && (
                <div className="form-group">
                  <label>Please specify your reason</label>
                  <textarea 
                    name="customDetail" 
                    className="form-control" 
                    rows={5} 
                    placeholder="Please describe the reason for your appointment..." 
                    value={formData.customDetail}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
              )}
              
              <div className="privacy-checkbox">
                <input 
                  type="checkbox" 
                  name="agreeToPrivacy" 
                  id="agreeToPrivacy"
                  checked={formData.agreeToPrivacy}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="agreeToPrivacy">
                  You agree to our friendly privacy policy.
                </label>
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading || !getAuthToken()}
              >
                {loading ? "Processing..." : "Confirm Appointment"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;