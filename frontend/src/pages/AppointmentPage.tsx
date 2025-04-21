import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import appointment_img from '../assets/appointment-page.png';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
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
  patient?: number | string;
  agreeToPrivacy: boolean;
  analyzed_image_id?: number | string; 
}

interface UserProfile {
  id: number;
  role: string;
  patient?: {
    id: number;
  };
}

interface WorkSchedule {
  day: string;
  start_hour: string;
  end_hour: string;
}

interface Appointment {
  date: string;
  start_time: string;
  end_time: string;
  dentist: number;
}

interface AvailableSlot {
  start: string;
  end: string;
}

interface SpecializationOption {
  value: string;
  label: string;
}

// Define specializations available in the system
const specializations: SpecializationOption[] = [
  { value: 'general', label: 'General Dentistry' },
  { value: 'orthodontics', label: 'Orthodontics' },
  { value: 'periodontics', label: 'Periodontics' },
  { value: 'endodontics', label: 'Endodontics' },
  { value: 'oral surgery', label: 'Oral Surgery' },
  { value: 'pediatric', label: 'Pediatric Dentistry' },
  { value: 'prosthodontics', label: 'Prosthodontics' }
];

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

// Map of visit reason to recommended specialization
const VISIT_REASON_TO_SPECIALIZATION: Record<string, string> = {
  "Regular Checkup": "general",
  "Teeth Cleaning": "general",
  "Toothache": "general",
  "Cavity/Filling": "general",
  "Root Canal": "endodontics",
  "Crown/Bridge Work": "prosthodontics",
  "Dentures": "prosthodontics",
  "Implants": "oral surgery",
  "Teeth Whitening": "general",
  "Orthodontic Consultation": "orthodontics",
  "Wisdom Teeth": "oral surgery",
  "Gum Disease Treatment": "periodontics",
  "Emergency Visit": "general",
  "Other": ""
};

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

interface DaySchedule {
  day: string;
  start_hour: string;
  end_hour: string;
  // add other properties if needed
}
let daySchedule: DaySchedule | undefined;

const AppointmentPage: React.FC = () => {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [availableEndTimes, setAvailableEndTimes] = useState<string[]>([]);
  const [analyzedImages, setAnalyzedImages] = useState<any[]>([]);
  const [filteredDentists, setFilteredDentists] = useState<Dentist[]>([]);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const [schedule, setSchedule] = useState<WorkSchedule[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(false);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [showAvailableSlots, setShowAvailableSlots] = useState<boolean>(false);

  const [formData, setFormData] = useState<AppointmentFormData>({
    detail: '',
    customDetail: '',
    date: '',
    start_time: '',
    end_time: '',
    dentist: 0,
    patient: '',
    agreeToPrivacy: false,
    analyzed_image_id: '',
  });
  
    const location = useLocation();
    
    // Add this effect to handle URL parameters when the component loads
    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const patientId = params.get('patient');
      
      if (patientId) {
        setFormData(prev => ({
          ...prev,
          patient: patientId
        }));
        
        // If you want to display a message that this was pre-selected
        const patientName = params.get('patientName');
        if (patientName) {
          setSuccessMessage(`Setting up appointment for ${patientName}`);
        }
      }
    }, [location]);
  useEffect(() => {
    const fetchAnalyzedImages = async () => {
      if (userProfile?.role !== 'patient') return; // Only fetch for patients
  
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user/analyses/`, {
          headers: getAuthHeader(),
        });
        setAnalyzedImages(response.data);
      } catch (err) {
        console.error('Error fetching analyzed images:', err);
        setError('Failed to load analyzed images.');
      }
    };
  
    if (userProfile) {
      fetchAnalyzedImages();
    }
  }, [userProfile]);
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

  // Filter dentists based on selected visit reason
  useEffect(() => {
    if (formData.detail && formData.detail !== 'Other') {
      const recommendedSpecialization = VISIT_REASON_TO_SPECIALIZATION[formData.detail];
      
      if (recommendedSpecialization) {
        const filtered = dentists.filter(
          dentist => dentist.specialization === recommendedSpecialization
        );
        
        setFilteredDentists(filtered.length > 0 ? filtered : dentists);
        
        // Auto-select the first dentist with the recommended specialization if available
        if (filtered.length > 0 && formData.dentist === 0) {
          setFormData(prev => ({
            ...prev,
            dentist: filtered[0].id || 0
          }));
        }
      } else {
        setFilteredDentists(dentists);
      }
    } else {
      setFilteredDentists(dentists);
    }
  }, [formData.detail, dentists]);

  // Effect to check for scheduling conflicts when date, dentist, or time changes
  useEffect(() => {
    if (formData.date && formData.dentist && formData.dentist !== 0) {
      checkAvailability();
    }
  }, [formData.date, formData.dentist]);

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
          setError('Please log in to continue.');
          return;
        }
  
        console.log('Fetching user profile with token:', token);
        const response = await axios.get(`${API_BASE_URL}/api/user/profile/`, {
          headers: getAuthHeader(),
        });
  
        console.log('User profile response:', response.data);
        setUserProfile(response.data);
  
        // Set patient ID for patients
        if (response.data.role === 'patient' && response.data.patient?.id) {
          setFormData((prev) => ({
            ...prev,
            patient: response.data.patient.id,
          }));
          console.log('Set patient ID to:', response.data.patient.id);
        } else if (response.data.role === 'patient') {
          console.warn('Patient profile missing ID:', response.data.patient);
          setError('Patient profile not found. Please contact support.');
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.error('Axios error fetching user profile:', err.response?.data || err.message);
          if (err.response?.status === 403 || err.response?.status === 401) {
            setError('Authentication error: Please log in again.');
          } else {
            setError('Failed to load user profile. Please try again.');
          }
        } else {
          console.error('Unexpected error:', err);
          setError('An unexpected error occurred while fetching your profile.');
        }
      } finally {
        setLoading(false);
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
          setFilteredDentists(response.data);
        } else if (response.data && typeof response.data === 'object') {
          // If response.data is an object with a results property
          const dentistsArray = response.data.results || [];
          setDentists(Array.isArray(dentistsArray) ? dentistsArray : []);
          setFilteredDentists(Array.isArray(dentistsArray) ? dentistsArray : []);
        } else {
          setDentists([]);
          setFilteredDentists([]);
          console.error('API response format unexpected:', response.data);
          setError('Received unexpected data format from server');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dentists:', err);
        setError('Failed to load dentists. Please try again later.');
        setLoading(false);
        setDentists([]);
        setFilteredDentists([]);
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
            headers: getAuthHeader(),
          });
  
          if (Array.isArray(response.data)) {
            console.log('Fetched patients:', response.data);
            // Check for duplicate or missing IDs
            const ids = response.data.map((p: Patient) => p.id);
            const uniqueIds = new Set(ids);
            if (ids.length !== uniqueIds.size) {
              console.warn('Duplicate patient IDs detected:', ids);
            }
            if (ids.some((id: number) => id == null || isNaN(id))) {
              console.warn('Invalid patient IDs detected:', ids);
            }
            setPatients(response.data);
          } else if (response.data && typeof response.data === 'object') {
            const patientsArray = response.data.results || [];
            console.log('Fetched patients (results):', patientsArray);
            const ids = patientsArray.map((p: Patient) => p.id);
            const uniqueIds = new Set(ids);
            if (ids.length !== uniqueIds.size) {
              console.warn('Duplicate patient IDs detected:', ids);
            }
            if (ids.some((id: number) => id == null || isNaN(id))) {
              console.warn('Invalid patient IDs detected:', ids);
            }
            setPatients(Array.isArray(patientsArray) ? patientsArray : []);
          } else {
            setPatients([]);
            console.error('Unexpected patients response format:', response.data);
          }
        } catch (err) {
          console.error('Error fetching patients:', err);
          setError('Failed to load patients. Please try again.');
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

    // Reset schedule view when dentist changes
    if (name === 'dentist') {
      setShowSchedule(false);
      setSchedule([]);
    }

    // Reset available slots when date changes
    if (name === 'date' || name === 'dentist') {
      setShowAvailableSlots(false);
      setAvailableSlots([]);
    }
  };

  const fetchDentistSchedule = async () => {
    if (!formData.dentist || formData.dentist === 0) {
      setError('Please select a doctor first');
      return;
    }

    try {
      setLoadingSchedule(true);
      setError(null);
      
      const response = await axios.get(
        `${API_BASE_URL}/api/dentists/${formData.dentist}/schedule/`,
        {
          headers: getAuthHeader()
        }
      );
      
      if (Array.isArray(response.data)) {
        setSchedule(response.data);
      } else if (response.data && typeof response.data === 'object' && response.data.results) {
        setSchedule(response.data.results);
      } else {
        setSchedule([]);
        setError('No schedule information available for this doctor');
      }
      
      setShowSchedule(true);
      setLoadingSchedule(false);
    } catch (err) {
      console.error('Error fetching dentist schedule:', err);
      setError('Failed to load doctor\'s schedule. Please try again later.');
      setLoadingSchedule(false);
    }
  };

  const checkAvailability = async () => {
    if (!formData.date || !formData.dentist || formData.dentist === 0) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Get the day of the week for the selected date
      const date = new Date(formData.date);
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
      
      // Get the dentist's schedule for that day
      const scheduleResponse = await axios.get(
        `${API_BASE_URL}/api/dentists/${formData.dentist}/schedule/`,
        {
          headers: getAuthHeader()
        }
      );
      
      let daySchedule: DaySchedule | undefined;
      if (Array.isArray(scheduleResponse.data)) {
        daySchedule = scheduleResponse.data.find((s: DaySchedule) => s.day === dayOfWeek);
      } else if (scheduleResponse.data && scheduleResponse.data.results) {
        daySchedule = scheduleResponse.data.results.find((s: DaySchedule) => s.day === dayOfWeek);
      }
      
      if (!daySchedule) {
        setError(`The doctor is not available on ${dayOfWeek}s`);
        setAvailableSlots([]);
        setShowAvailableSlots(true);
        setLoading(false);
        return;
      }
      
      // Get existing appointments for the dentist on that date
      const appointmentsResponse = await axios.get(
        `${API_BASE_URL}/api/appointments/`,
        {
          headers: getAuthHeader(),
          params: {
            dentist: formData.dentist,
            date: formData.date
          }
        }
      );
      
      let appointments = [];
      if (Array.isArray(appointmentsResponse.data)) {
        appointments = appointmentsResponse.data;
      } else if (appointmentsResponse.data && appointmentsResponse.data.results) {
        appointments = appointmentsResponse.data.results;
      }
      
      setExistingAppointments(appointments);
      
      // Generate available time slots
      const availableTimeSlots = generateAvailableTimeSlots(
        daySchedule.start_hour,
        daySchedule.end_hour,
        appointments
      );
      
      setAvailableSlots(availableTimeSlots);
      setShowAvailableSlots(true);
      setLoading(false);
    } catch (err) {
      console.error('Error checking availability:', err);
      setError('Failed to check appointment availability');
      setLoading(false);
    }
  };

  const generateAvailableTimeSlots = (
    startHour: string,
    endHour: string,
    appointments: Appointment[]
  ): AvailableSlot[] => {
    // Convert to 24-hour format
    const start = parseInt(startHour, 10);
    const end = parseInt(endHour, 10);
    
    // Generate all possible 30-minute slots
    const allSlots: AvailableSlot[] = [];
    for (let hour = start; hour < end; hour++) {
      // Full hour slot
      allSlots.push({
        start: `${hour.toString().padStart(2, '0')}:00`,
        end: `${hour.toString().padStart(2, '0')}:30`
      });
      
      // Half hour slot
      allSlots.push({
        start: `${hour.toString().padStart(2, '0')}:30`,
        end: `${(hour + 1).toString().padStart(2, '0')}:00`
      });
    }
    
    // Filter out slots that overlap with existing appointments
    return allSlots.filter(slot => {
      return !appointments.some(appt => {
        // Extract hour and minute from appointment times
        const apptStart = appt.start_time.split(':');
        const apptEnd = appt.end_time.split(':');
        const slotStart = slot.start.split(':');
        const slotEnd = slot.end.split(':');
        
        // Convert to minutes since midnight for easier comparison
        const apptStartMinutes = parseInt(apptStart[0]) * 60 + parseInt(apptStart[1]);
        const apptEndMinutes = parseInt(apptEnd[0]) * 60 + parseInt(apptEnd[1]);
        const slotStartMinutes = parseInt(slotStart[0]) * 60 + parseInt(slotStart[1]);
        const slotEndMinutes = parseInt(slotEnd[0]) * 60 + parseInt(slotEnd[1]);
        
        // Check for overlap
        return (
          (slotStartMinutes >= apptStartMinutes && slotStartMinutes < apptEndMinutes) ||
          (slotEndMinutes > apptStartMinutes && slotEndMinutes <= apptEndMinutes) ||
          (slotStartMinutes <= apptStartMinutes && slotEndMinutes >= apptEndMinutes)
        );
      });
    });
  };

  const selectTimeSlot = (slot: AvailableSlot) => {
    setFormData(prev => ({
      ...prev,
      start_time: slot.start,
      end_time: slot.end
    }));
    setShowAvailableSlots(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
  
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
  
      const finalDetail =
        formData.detail === 'Other' ? formData.customDetail : formData.detail;
  
      if (formData.detail === 'Other' && !formData.customDetail.trim()) {
        setError('Please specify the reason for your visit.');
        setLoading(false);
        return;
      }
  
      const appointmentData: any = {
        detail: finalDetail,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        dentist: Number(formData.dentist),
        analyzed_image_id: formData.analyzed_image_id
          ? Number(formData.analyzed_image_id)
          : undefined, // Include only if selected
      };
  
      // Set patient ID based on user role
      if (userProfile?.role === 'dentist' && formData.patient) {
        appointmentData.patient = Number(formData.patient);
      } else if (userProfile?.role === 'patient' && userProfile?.patient?.id) {
        appointmentData.patient = Number(userProfile.patient.id);
      } else {
        setError('Patient profile not found. Please contact support.');
        setLoading(false);
        return;
      }
  
      console.log('Submitting appointment data:', appointmentData);
      const response = await axios.post(
        `${API_BASE_URL}/api/appointments/`,
        appointmentData,
        {
          headers: getAuthHeader(),
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
        analyzed_image_id: '',
      });
  
      setShowSchedule(false);
      setShowAvailableSlots(false);
    } catch (err: any) {
      console.error('Error scheduling appointment:', err);
      if (err.response) {
        console.error('Response error data:', err.response.data);
        setError(
          err.response.data.detail ||
            Object.values(err.response.data).flat().join(' ') ||
            'An error occurred while scheduling your appointment.'
        );
      } else {
        setError('Failed to schedule appointment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format time for display (24hr -> 12hr format)
  const formatTime = (time: string): string => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${hour12}:${minute} ${period}`;
  };

  // Get specialization label from value
  const getSpecializationLabel = (value: string): string => {
    const specialization = specializations.find(spec => spec.value === value);
    return specialization ? specialization.label : value;
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
              <h1>
                MAKE AN <span>APPOINTMENT</span>
              </h1>
              <h2>Consult with our Doctor</h2>
            </div>
  
            {!getAuthToken() && (
              <div className="error-message">
                You need to login before making an appointment.
              </div>
            )}
  
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
  
            {error && <div className="error-message">{error}</div>}
  
            <form className="appointment-form" onSubmit={handleSubmit}>
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
                {formData.detail &&
                  formData.detail !== "Other" &&
                  VISIT_REASON_TO_SPECIALIZATION[formData.detail] && (
                    <div className="recommendation-note">
                      <small>
                        Recommended:{" "}
                        {getSpecializationLabel(
                          VISIT_REASON_TO_SPECIALIZATION[formData.detail]
                        )}
                      </small>
                    </div>
                  )}
              </div>
  
              {formData.detail === "Other" && (
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
  
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    className="form-control"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>
              {userProfile?.role === "patient" && (
              <div className="form-group">
                <label>Analyzed Image (Optional)</label>
                <select
                  name="analyzed_image_id"
                  className="form-control"
                  value={formData.analyzed_image_id}
                  onChange={handleChange}
                >
                  <option value="">Select an analyzed image (optional)</option>
                  {analyzedImages.map((image) => (
                    <option key={image.id} value={image.id}>
                      Image analyzed on {new Date(image.created_at).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
               )}
  
              {userProfile?.role === "dentist" && (
              <div className="form-group">
                <label>Patient</label>
                <select
                  name="patient"
                  className="form-control"
                  value={formData.patient === undefined ? '' : formData.patient}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient, index) => (
                    <option
                      key={patient.id ?? `patient-${index}`} // Fallback to index if id is missing
                      value={patient.id}
                    >
                      {patient.user.first_name} {patient.user.last_name}
                    </option>
                  ))}
                </select>
              </div>
              )}
  
              <div className="form-group">
                <label>Doctor</label>
                <div className="dentist-selector">
                  <select
                    name="dentist"
                    className="form-control"
                    value={formData.dentist}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {loading ? (
                      <option value="" disabled>
                        Loading dentists...
                      </option>
                    ) : Array.isArray(filteredDentists) &&
                      filteredDentists.length > 0 ? (
                      filteredDentists.map((dentist) => (
                        <option
                          key={dentist.user.id}
                          value={dentist.id || dentist.user.id}
                        >
                          Dr. {dentist.user.first_name} {dentist.user.last_name} -{" "}
                          {getSpecializationLabel(dentist.specialization)}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No doctors available
                      </option>
                    )}
                  </select>
                  {formData.dentist !== 0 && (
                    <button
                      type="button"
                      className="view-schedule-btn"
                      onClick={fetchDentistSchedule}
                      disabled={loadingSchedule}
                    >
                      {loadingSchedule ? "Loading..." : "View Schedule"}
                    </button>
                  )}
                </div>
              </div>
  
              {showSchedule && (
                <div className="schedule-container">
                  <h3>Doctor's Schedule</h3>
                  {schedule.length > 0 ? (
                    <table className="schedule-table">
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Working Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.map((daySchedule, index) => (
                          <tr key={index}>
                            <td>{daySchedule.day}</td>
                            <td>
                              {formatTime(`${daySchedule.start_hour}:00`)} -{" "}
                              {formatTime(`${daySchedule.end_hour}:00`)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No schedule information available for this doctor.</p>
                  )}
                </div>
              )}
  
              <div className="form-row">
                <div className="form-group time-selection">
                  <label>Select Time</label>
                  <div className="time-buttons">
                    <button
                      type="button"
                      className="check-availability-btn"
                      onClick={checkAvailability}
                      disabled={
                        !formData.date ||
                        !formData.dentist ||
                        formData.dentist === 0
                      }
                    >
                      Check Available Slots
                    </button>
                  </div>
  
                  {showAvailableSlots && (
                    <div className="available-slots-container">
                      <h3>Available Time Slots</h3>
                      {availableSlots.length > 0 ? (
                        <div className="time-slots-grid">
                          {availableSlots.map((slot, index) => (
                            <button
                              key={index}
                              type="button"
                              className="time-slot-btn"
                              onClick={() => selectTimeSlot(slot)}
                            >
                              {formatTime(slot.start)} - {formatTime(slot.end)}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p>
                          No available slots for this date. Please select another
                          date.
                        </p>
                      )}
                    </div>
                  )}
  
                  {formData.start_time && formData.end_time && (
                    <div className="selected-time">
                      <p>
                        Selected Time:{" "}
                        <strong>
                          {formatTime(formData.start_time)} -{" "}
                          {formatTime(formData.end_time)}
                        </strong>
                      </p>
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
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
  
export default AppointmentPage;