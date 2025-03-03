// pages/AppointmentPage.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';

interface FormData {
  name: string;
  phone: string;
  date: string;
  doctor: string;
  reason: string;
  message: string;
  agreeToPrivacy: boolean;
}

const AppointmentPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    date: '',
    doctor: '',
    reason: '',
    message: '',
    agreeToPrivacy: false,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  return (
    <div className="appointment-page">
      <div className="container">
        <div className="appointment-hero">
          <div className="appointment-image">
            <img src="/images/patient-smiling.jpg" alt="Happy dental patient" />
          </div>
          
          <div className="appointment-form-container">
            <div className="appointment-title">
              <h1>MAKE AN <span>APPOINTMENT</span></h1>
              <h2>Consult with our Doctor</h2>
            </div>
            
            <form className="appointment-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-control" 
                  placeholder="Full name" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <div className="phone-input-container">
                    <input 
                      type="tel" 
                      name="phone" 
                      className="form-control" 
                      placeholder="+977" 
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    className="form-control" 
                    placeholder="DD/MM/YYYY" 
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Doctor</label>
                  <select 
                    name="doctor" 
                    className="form-control"
                    value={formData.doctor}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Doctor</option>
                    <option value="Dr. John">Dr. John</option>
                    <option value="Dr. Smith">Dr. Smith</option>
                    <option value="Dr. Clark">Dr. Clark</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Reason</label>
                  <select 
                    name="reason" 
                    className="form-control"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Reason</option>
                    <option value="Consultancy">Consultancy</option>
                    <option value="Treatment">Treatment</option>
                    <option value="Checkup">Checkup</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Message</label>
                <textarea 
                  name="message" 
                  className="form-control" 
                  rows={5} 
                  placeholder="Include a message..." 
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>
              
              <button type="button" className="upload-btn">
                Upload Image
              </button>
              
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
              
              <button type="submit" className="submit-btn">
                Confirm Appointment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;
