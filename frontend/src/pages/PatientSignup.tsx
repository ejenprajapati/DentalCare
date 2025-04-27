import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoTooth from '../assets/tooth-logo.png';
import api from "../api";

interface GenderOption {
  value: string;
  label: string;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  gender?: string;
  emergencyContact?: string;
}

function PatientSignupPage() {
  const genders: GenderOption[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
  ];

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    gender: '',
    emergencyContact: '',
    allergies: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const navigate = useNavigate();

  // Validate form data whenever it changes
  useEffect(() => {
    validateForm();
  }, [formData]);

  // Check username availability - debounced
  useEffect(() => {
    if (!formData.username || formData.username.length < 3) return;
    
    const usernameTimer = setTimeout(() => {
      checkUsernameAvailability(formData.username);
    }, 500); // Wait 500ms after typing stops
    
    return () => clearTimeout(usernameTimer);
  }, [formData.username]);

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) return;
    
    setCheckingUsername(true);
    try {
      const response = await api.get(`/api/user/check-username/?username=${username}`);
      
      // If API doesn't exist, simulate check by assuming username is taken if it matches these examples
      // In a real implementation, this would be an actual API call to the backend
      const isUsernameTaken = 
        ['admin', 'test', 'user', 'patient1', 'dentist'].includes(username.toLowerCase());
      
      if (isUsernameTaken) {
        setErrors(prev => ({
          ...prev,
          username: "Username already taken"
        }));
      } else {
        // Remove username error if it was previously set
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.username;
          return newErrors;
        });
      }
    } catch (error) {
      console.error("Error checking username:", error);
      // If the API fails, revert to fallback validation
      const isUsernameTaken = 
        ['admin', 'test', 'user', 'patient1', 'dentist'].includes(username.toLowerCase());
      
      if (isUsernameTaken) {
        setErrors(prev => ({
          ...prev,
          username: "Username already taken"
        }));
      }
    } finally {
      setCheckingUsername(false);
    }
  };

  const validateForm = () => {
    const newErrors: ValidationErrors = {};

    // Username validation
    if (formData.username && formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Email validation - must have at least 4 chars before @
    if (formData.email) {
      const emailParts = formData.email.split('@');
      if (emailParts[0].length < 4) {
        newErrors.email = "Email must have at least 4 characters before @";
      } else if (formData.email.endsWith('@dentalcare.com')) {
        newErrors.email = "Patient email cannot end with @dentalcare.com";
      }
    }

    // Phone number validation - must be 10 digits starting with 98
    if (formData.phoneNumber) {
      if (!/^98\d{8}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Phone number must be 10 digits starting with 98";
      }
    }

    // Password validation - minimum 6 characters
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    // Emergency contact - same format as phone number
    if (formData.emergencyContact) {
      if (!/^98\d{8}$/.test(formData.emergencyContact)) {
        newErrors.emergencyContact = "Emergency contact must be 10 digits starting with 98";
      }
    }

    // Keep existing username error if we have one (from API)
    if (errors.username && errors.username === "Username already taken") {
      newErrors.username = errors.username;
    }

    setErrors(prev => ({
      ...newErrors,
      // Preserve username error from API check if it exists
      ...(prev.username === "Username already taken" ? { username: prev.username } : {})
    }));
    
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    if (!validateForm()) {
      return; // Don't submit if validation fails
    }

    if (!formData.gender) {
      setErrors(prev => ({
        ...prev,
        gender: "Please select your gender"
      }));
      return;
    }

    // Check if username is already taken one more time before submitting
    try {
      setLoading(true);

      // This is where you would check username availability one last time
      // For demonstration, using our simulated check
      const isUsernameTaken = 
        ['admin', 'test', 'user', 'patient1', 'dentist'].includes(formData.username.toLowerCase());
      
      if (isUsernameTaken) {
        setErrors(prev => ({
          ...prev,
          username: "Username already taken"
        }));
        setLoading(false);
        return;
      }

      const requestData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber,
        gender: formData.gender,
        emergency_contact: formData.emergencyContact,
        allergies: formData.allergies
      };
        
      // Call patient registration endpoint
      await api.post("/api/user/register/patient/", requestData);

      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Check if the error response contains a username already exists error
      if (error.response && error.response.data && error.response.data.username) {
        setErrors(prev => ({
          ...prev,
          username: error.response.data.username[0] || "Username already taken"
        }));
      } else {
        alert("Registration failed: " + (error instanceof Error ? error.message : String(error)));
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine if field should show error
  const showError = (fieldName: string) => {
    return touched[fieldName] && errors[fieldName as keyof ValidationErrors];
  };

  return (
    <div className="auth-page signup-page">
      <div className="auth-container">
        <div className="auth-image">
          <img src={logoTooth} alt="Dental Care Logo" className="tooth-logo" />
          <h2>DENTAL CARE</h2>
        </div>
        
        <div className="auth-form-container">
          <h2>Create Patient Account</h2>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className={`form-group ${showError('firstName') ? 'error' : ''}`}>
              <div className="input-icon">
                <i className="fas fa-user"></i>
              </div>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={showError('firstName') ? 'input-error' : ''}
              />
              {showError('firstName') && <div className="error-message">{errors.firstName}</div>}
            </div>

            <div className={`form-group ${showError('lastName') ? 'error' : ''}`}>
              <div className="input-icon">
                <i className="fas fa-user"></i>
              </div>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={showError('lastName') ? 'input-error' : ''}
              />
              {showError('lastName') && <div className="error-message">{errors.lastName}</div>}
            </div>
            
            <div className={`form-group ${showError('username') ? 'error' : ''}`}>
              <div className="input-icon">
                <i className="fas fa-user"></i>
              </div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={showError('username') ? 'input-error' : ''}
              />
              {checkingUsername && <div className="info-message">Checking username...</div>}
              {showError('username') && <div className="error-message">{errors.username}</div>}
            </div>
            
            <div className={`form-group ${showError('email') ? 'error' : ''}`}>
              <div className="input-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <input
                type="email"
                name="email"
                placeholder="Enter your Email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={showError('email') ? 'input-error' : ''}
              />
              {showError('email') && <div className="error-message">{errors.email}</div>}
            </div>

            <div className={`form-group ${showError('phoneNumber') ? 'error' : ''}`}>
              <div className="input-icon">
                <i className="fas fa-phone"></i>
              </div>
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number (10 digits starting with 98)"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={showError('phoneNumber') ? 'input-error' : ''}
              />
              {showError('phoneNumber') && <div className="error-message">{errors.phoneNumber}</div>}
            </div>

            {/* Gender Selection */}
            <div className={`form-group ${showError('gender') ? 'error' : ''}`}>
              <label htmlFor="gender">Gender:</label>
              <select
                name="gender"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={showError('gender') ? 'input-error' : ''}
              >
                <option value="">Select Gender</option>
                {genders.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {showError('gender') && <div className="error-message">{errors.gender}</div>}
            </div>
            
            <div className={`form-group ${showError('password') ? 'error' : ''}`}>
              <div className="input-icon">
                <i className="fas fa-lock"></i>
              </div>
              <input
                type="password"
                name="password"
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={showError('password') ? 'input-error' : ''}
              />
              {showError('password') && <div className="error-message">{errors.password}</div>}
            </div>
            
            <div className={`form-group ${showError('confirmPassword') ? 'error' : ''}`}>
              <div className="input-icon">
                <i className="fas fa-lock"></i>
              </div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-type Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={showError('confirmPassword') ? 'input-error' : ''}
              />
              {showError('confirmPassword') && <div className="error-message">{errors.confirmPassword}</div>}
            </div>

            <div className={`form-group ${showError('emergencyContact') ? 'error' : ''}`}>
              <div className="input-icon">
                <i className="fas fa-phone"></i>
              </div>
              <input
                type="text"
                name="emergencyContact"
                placeholder="Emergency Contact Number (10 digits starting with 98)"
                value={formData.emergencyContact}
                onChange={handleChange}
                onBlur={handleBlur}
                className={showError('emergencyContact') ? 'input-error' : ''}
              />
              {showError('emergencyContact') && <div className="error-message">{errors.emergencyContact}</div>}
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
              disabled={loading || checkingUsername || Object.keys(errors).length > 0}
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>
          
          <p className="auth-redirect">
            Have account? <Link to="/login">Sign In</Link>
          </p>
          <p className="auth-redirect">
            Are you a dentist? <Link to="/signup/dentist">Register as Dentist</Link>
          </p>
        </div>
      </div>
    </div>
  );
}



export default PatientSignupPage;