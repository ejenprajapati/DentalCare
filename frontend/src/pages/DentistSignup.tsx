import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoTooth from '../assets/tooth-logo.png';
import api from "../api";

// Define option types
interface SpecializationOption {
  value: string;
  label: string;
}

interface ExperienceOption {
  value: string;
  label: string;
}

interface QualificationOption {
  value: string;
  label: string;
}

interface GenderOption {
  value: string;
  label: string;
}

interface WorkingDay {
  day: string;
  checked: boolean;
  startHour: string;
  endHour: string;
}

interface HourOption {
  value: string;
  label: string;
}

function DentistSignupPage() {
  // Options for dropdown menus
  const specializations: SpecializationOption[] = [
    { value: 'general', label: 'General Dentistry' },
    { value: 'orthodontics', label: 'Orthodontics' },
    { value: 'periodontics', label: 'Periodontics' },
    { value: 'endodontics', label: 'Endodontics' },
    { value: 'oral surgery', label: 'Oral Surgery' },
    { value: 'pediatric', label: 'Pediatric Dentistry' },
    { value: 'prosthodontics', label: 'Prosthodontics' }
  ];

  const experiences: ExperienceOption[] = [
    { value: '<1', label: 'Less than 1 year' },
    { value: '1', label: '1 year' },
    { value: '2', label: '2 years' },
    { value: '3+', label: '3+ years' }
  ];

  const qualifications: QualificationOption[] = [
    { value: 'DDS', label: 'Doctor of Dental Surgery (DDS)' },
    { value: 'DMD', label: 'Doctor of Dental Medicine (DMD)' },
    { value: 'BDS', label: 'Bachelor of Dental Surgery (BDS)' },
    { value: 'MDS', label: 'Master of Dental Surgery (MDS)' },
    { value: 'PhD', label: 'PhD in Dental Sciences' }
  ];

  const genders: GenderOption[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
  ];

  // Initialize working days with default start/end hours
  const initialWorkingDays: WorkingDay[] = [
    { day: 'Sunday', checked: false, startHour: '9', endHour: '17' },
    { day: 'Monday', checked: false, startHour: '9', endHour: '17' },
    { day: 'Tuesday', checked: false, startHour: '9', endHour: '17' },
    { day: 'Wednesday', checked: false, startHour: '9', endHour: '17' },
    { day: 'Thursday', checked: false, startHour: '9', endHour: '17' },
    { day: 'Friday', checked: false, startHour: '9', endHour: '17' },
    { day: 'Saturday', checked: false, startHour: '9', endHour: '17' },
  ];

  // Hours options for dropdown (9 AM to 5 PM)
  const hoursOptions: HourOption[] = Array.from({ length: 9 }, (_, index) => {
    const hour = index + 9;
    const hourStr = hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`;
    return { value: hour.toString(), label: hourStr };
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    gender: '',
    specialization: '',
    experience: '',
    qualification: '',
    workingDays: [...initialWorkingDays],
    agreeTerms: false
  });

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [hoursErrors, setHoursErrors] = useState<{[key: string]: string}>({});
  const [daysError, setDaysError] = useState('');
  const navigate = useNavigate();

  // Check email domain when email changes
  useEffect(() => {
    if (formData.email && !formData.email.endsWith('@dentalcare.com')) {
      setEmailError('Dentist email must end with @dentalcare.com');
    } else {
      setEmailError('');
    }
  }, [formData.email]);

  // Validate working hours when they change
  useEffect(() => {
    const newHoursErrors: {[key: string]: string} = {};
    
    formData.workingDays.forEach((day, index) => {
      if (day.checked) {
        const startHourNum = parseInt(day.startHour);
        const endHourNum = parseInt(day.endHour);
        
        if (startHourNum >= endHourNum) {
          newHoursErrors[day.day] = 'End time must be after start time';
        } else if (endHourNum - startHourNum < 5) {
          newHoursErrors[day.day] = 'Working hours must be at least 5 hours';
        }
      }
    });
    
    setHoursErrors(newHoursErrors);
  }, [formData.workingDays]);

  // Validate that at least one working day is selected
  useEffect(() => {
    const selectedDays = formData.workingDays.filter(day => day.checked);
    if (selectedDays.length === 0) {
      setDaysError('Please select at least one working day');
    } else {
      setDaysError('');
    }
  }, [formData.workingDays]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDayChange = (index: number) => {
    const updatedDays = [...formData.workingDays];
    updatedDays[index].checked = !updatedDays[index].checked;
    
    setFormData(prev => ({
      ...prev,
      workingDays: updatedDays
    }));
  };

  const handleHourChange = (index: number, field: 'startHour' | 'endHour', value: string) => {
    const updatedDays = [...formData.workingDays];
    updatedDays[index][field] = value;
    
    setFormData(prev => ({
      ...prev,
      workingDays: updatedDays
    }));
  };

  const hasErrors = () => {
    return !!emailError || Object.keys(hoursErrors).length > 0 || !!daysError;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (hasErrors()) {
      alert("Please fix the errors before submitting.");
      return;
    }

    if (!formData.gender) {
      alert("Please select your gender!");
      return;
    }

    setLoading(true);

    try {
      // Prepare working schedule data
      const workSchedule = formData.workingDays
        .filter(day => day.checked)
        .map(day => ({
          day: day.day,
          start_hour: day.startHour,
          end_hour: day.endHour
        }));

      const requestData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber,
        gender: formData.gender,
        specialization: formData.specialization,
        experience: formData.experience,
        qualification: formData.qualification,
        work_schedule: workSchedule
      };
      
      // Call dentist registration endpoint
      await api.post("/api/user/register/dentist/", requestData);

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page signup-page">
      <div className="auth-container">
        <div className="auth-image">
          <img src={logoTooth} alt="Dental Care Logo" className="tooth-logo" />
          <h2>DENTAL CARE</h2>
        </div>
        
        <div className="auth-form-container">
          <h2>Create Dentist Account</h2>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-user"></i>
              </div>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-user"></i>
              </div>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-user"></i>
              </div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <input
                type="email"
                name="email"
                placeholder="Enter your Email (@dentalcare.com)"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {emailError && <div className="error-message">{emailError}</div>}
            </div>

            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-phone"></i>
              </div>
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* Gender Selection */}
            <div className="form-group">
              <label htmlFor="gender">Gender:</label>
              <select
                name="gender"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                {genders.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-lock"></i>
              </div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-lock"></i>
              </div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-type Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Dentist specific fields */}
            <div className="form-group">
              <label htmlFor="specialization">Specialization:</label>
              <select
                name="specialization"
                id="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
              >
                <option value="">Select Specialization</option>
                {specializations.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="experience">Experience:</label>
              <select
                name="experience"
                id="experience"
                value={formData.experience}
                onChange={handleChange}
                required
              >
                <option value="">Select Experience</option>
                {experiences.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="qualification">Qualification:</label>
              <select
                name="qualification"
                id="qualification"
                value={formData.qualification}
                onChange={handleChange}
                required
              >
                <option value="">Select Qualification</option>
                {qualifications.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Working Days and Hours Selection */}
            <div className="form-group">
              <label>Working Days and Hours (minimum 5 hours per day):</label>
              <div className="working-days-container">
                {formData.workingDays.map((day, index) => (
                  <div key={day.day} className="day-schedule" style={{ 
                    border: '1px solid #ccc', 
                    borderRadius: '5px', 
                    padding: '10px', 
                    marginBottom: '10px' 
                  }}>
                    <div className="day-checkbox" style={{ marginBottom: '10px' }}>
                      <input
                        type="checkbox"
                        id={`day-${day.day}`}
                        checked={day.checked}
                        onChange={() => handleDayChange(index)}
                      />
                      <label htmlFor={`day-${day.day}`} style={{ fontWeight: 'bold', marginLeft: '5px' }}>
                        {day.day}
                      </label>
                    </div>
                    
                    {day.checked && (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: '25px' }}>
                        <select
                          value={day.startHour}
                          onChange={(e) => handleHourChange(index, 'startHour', e.target.value)}
                          style={{ flex: 1 }}
                        >
                          {hoursOptions.map(option => (
                            <option key={`${day.day}-start-${option.value}`} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <span>to</span>
                        <select
                          value={day.endHour}
                          onChange={(e) => handleHourChange(index, 'endHour', e.target.value)}
                          style={{ flex: 1 }}
                        >
                          {hoursOptions.map(option => (
                            <option key={`${day.day}-end-${option.value}`} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {day.checked && hoursErrors[day.day] && (
                      <div className="error-message" style={{ marginLeft: '25px', color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>
                        {hoursErrors[day.day]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {daysError && <div className="error-message">{daysError}</div>}
            </div>
            
            <div className="form-options">
              <div className="terms-checkbox">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="agreeTerms">I agree with Terms and Privacy</label>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading || hasErrors()}
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>
          
          <p className="auth-redirect">
            Have account? <Link to="/login">Sign In</Link>
          </p>
          <p className="auth-redirect">
            Are you a patient? <Link to="/signup">Register as Patient</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DentistSignupPage;