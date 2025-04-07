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

function SignupPage() {
  // Options for dropdown menus
  const specializations: SpecializationOption[] = [
    { value: 'general', label: 'General Dentistry' },
    { value: 'orthodontics', label: 'Orthodontics' },
    { value: 'periodontics', label: 'Periodontics' },
    { value: 'endodontics', label: 'Endodontics' },
    { value: 'oral_surgery', label: 'Oral Surgery' },
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

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'patient', // Default role
    // Dentist specific fields
    specialization: '',
    experience: '',
    qualification: '',
    // Patient specific fields
    emergencyContact: '',
    allergies: '',
    agreeTerms: false
  });

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  // Check email domain when email changes
  useEffect(() => {
    if (formData.email) {
      if (formData.role === 'dentist' && !formData.email.endsWith('@dentalcare.com')) {
        setEmailError('Dentist email must end with @dentalcare.com');
      } else if (formData.role === 'patient' && formData.email.endsWith('@dentalcare.com')) {
        setEmailError('Patient email cannot end with @dentalcare.com');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  }, [formData.email, formData.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (emailError) {
      alert(emailError);
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber
      };

      // Add role-specific fields
      if (formData.role === 'dentist') {
        Object.assign(requestData, {
          specialization: formData.specialization,
          experience: formData.experience,
          qualification: formData.qualification
        });
        
        // Call dentist registration endpoint
        await api.post("/api/user/register/dentist/", requestData);
      } else {
        Object.assign(requestData, {
          emergency_contact: formData.emergencyContact,
          allergies: formData.allergies
        });
        
        // Call patient registration endpoint
        await api.post("/api/user/register/patient/", requestData);
      }

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
          <h2>Create An Account</h2>
          
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
                placeholder="Enter your Email"
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

            <div className="form-group">
              <label htmlFor="role">Register as:</label>
              <select
                name="role"
                id="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="patient">Patient</option>
                <option value="dentist">Dentist</option>
              </select>
            </div>

            {/* Conditional fields based on role */}
            {formData.role === 'dentist' ? (
              // Dentist specific fields
              <>
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
              </>
            ) : (
              // Patient specific fields
              <>
                <div className="form-group">
                  <div className="input-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <input
                    type="text"
                    name="emergencyContact"
                    placeholder="Emergency Contact Number"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <div className="input-icon">
                    <i className="fas fa-notes-medical"></i>
                  </div>
                  <textarea
                    name="allergies"
                    placeholder="List any allergies or medical conditions"
                    value={formData.allergies}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </>
            )}
            
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
              disabled={loading || !!emailError}
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>
          
          <p className="auth-redirect">
            Have account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;  