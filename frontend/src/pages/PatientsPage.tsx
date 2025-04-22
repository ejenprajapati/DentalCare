import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/PatientsPage.css';

interface Patient {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  appointments: Appointment[];
}

interface Appointment {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  detail: string;
  approved: boolean;
  treatment?: string | null;
  analyzed_image?: ImageAnalysis | null;
  patient: number;
}

interface ImageAnalysis {
  id: number;
  original_image: {
    id: number;
    image: string;
    image_url: string;
  };
  analyzed_image_url: string;
  created_at: string;
  diseases: Disease[];
  total_conditions: number;
  calculus_count: number;
  caries_count: number;
  gingivitis_count: number;
  hypodontia_count: number;
  tooth_discolation_count: number;
  ulcer_count: number;
}

interface Disease {
  id: number;
  name: string;
  description: string;
}

interface AppointmentRow {
  id: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  phoneNumber: string;
  date: string;
  treatment: string | null;
  analyzedImage: ImageAnalysis | null;
}

const PatientsPage: React.FC = () => {
  const [appointmentRows, setAppointmentRows] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [editingTreatment, setEditingTreatment] = useState<number | null>(null);
  const navigate = useNavigate();
  const BASE_URL = 'http://127.0.0.1:8000';

  const treatmentOptions = ["Pending",
    "Regular Checkup", "Teeth Cleaning", "Toothache", "Cavity/Filling",
    "Teeth Whitening", "Root Canal", "Crown/Bridge Work", "Dentures",
    "Implants", "Wisdom Teeth", "Orthodontic Consultation",
    "Gum Disease Treatment", "Other"
  ];

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('access');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Fetch all appointments
        const appointmentsResponse = await axios.get(`${BASE_URL}/api/appointments/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Fetched appointments:', appointmentsResponse.data);
        
        // Fetch patients to get their details
        const patientsResponse = await axios.get(`${BASE_URL}/api/patients/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Fetched patients:', patientsResponse.data);
        
        // Create a map of patient IDs to patient details for quick lookups
        const patientMap = new Map();
        patientsResponse.data.forEach((patient: Patient) => {
          patientMap.set(patient.id, patient);
        });

        // Transform appointments into rows with patient details
        const rows = appointmentsResponse.data.map((appointment: Appointment) => {
          const patient = patientMap.get(appointment.patient);
          return {
            id: appointment.id,
            patientId: appointment.patient,
            patientName: patient ? `${patient.user.first_name} ${patient.user.last_name}` : 'Unknown Patient',
            patientEmail: patient ? patient.user.email : 'N/A',
            phoneNumber: patient ? patient.user.phone_number || 'N/A' : 'N/A',
            date: appointment.date,
            treatment: appointment.treatment,
            analyzedImage: appointment.analyzed_image
          };
        });
        
        setAppointmentRows(rows);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [navigate]);

  const viewAnalysisDetails = async (analysis: ImageAnalysis) => {
    try {
      if (!analysis) {
        throw new Error('No analysis data available');
      }
      
      // Prepare the analysis data for the results page
      const analysisData = {
        originalImage: getImageUrl(analysis.original_image?.image_url || analysis.original_image?.image),
        analyzedImage: getImageUrl(analysis.analyzed_image_url),
        totalConditionsDetected: analysis.total_conditions,
        calculusCount: analysis.calculus_count,
        cariesCount: analysis.caries_count,
        gingivitisCount: analysis.gingivitis_count,
        hypodontiaCount: analysis.hypodontia_count,
        toothDiscolationCount: analysis.tooth_discolation_count,
        ulcerCount: analysis.ulcer_count,
        analysisId: analysis.id
      };
      
      sessionStorage.setItem('analysisResults', JSON.stringify(analysisData));
      navigate('/results');
    } catch (error) {
      console.error('Error navigating to results:', error);
      alert('There was an error viewing the analysis details. Please try again.');
    }
  };

  const handleSetAppointment = (patientId: number) => {
    // Try with just /appointments instead of /appointments/new
    navigate(`/appointment?patient=${patientId}`);
  };

  const handleTreatmentChange = async (appointmentId: number, newTreatment: string) => {
    try {
      const token = localStorage.getItem('access');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      await axios.patch(`${BASE_URL}/api/appointments/${appointmentId}/`, 
        { treatment: newTreatment }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setAppointmentRows(prevRows => 
        prevRows.map(row => 
          row.id === appointmentId ? { ...row, treatment: newTreatment } : row
        )
      );
      
      // Close dropdown
      setEditingTreatment(null);
    } catch (error) {
      console.error('Error updating treatment:', error);
      alert('Failed to update treatment. Please try again.');
    }
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) {
      return '/placeholder-dental.png';
    }
    
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    return `${BASE_URL}${imagePath}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const renderTreatmentDropdown = (appointmentId: number, currentTreatment: string | null) => {
    const treatmentValue = currentTreatment || "Pending";
    const isEditing = editingTreatment === appointmentId;

    return (
      <div className="treatment-control">
        <div className="treatment-display">
          <span>{treatmentValue}</span>
          <button 
            className="edit-btn"
            onClick={() => setEditingTreatment(isEditing ? null : appointmentId)}
          >
            Edit
          </button>
        </div>
        
        {isEditing && (
          <div className="treatment-dropdown">
            {treatmentOptions.map((option) => (
              <div key={option} className="treatment-option">
                <button 
                  className={`option-btn ${treatmentValue === option ? 'selected' : ''}`}
                  onClick={() => handleTreatmentChange(appointmentId, option)}
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

  if (loading) {
    return <div className="loading">Loading appointments data...</div>;
  }

  // Apply filters and sorting
  let filteredRows = appointmentRows.filter(row => {
    const patientName = row.patientName.toLowerCase();
    const patientEmail = row.patientEmail.toLowerCase();
    const phoneNumber = row.phoneNumber;
    const searchLower = searchTerm.toLowerCase();
    
    return patientName.includes(searchLower) || 
           patientEmail.includes(searchLower) || 
           phoneNumber.includes(searchTerm);
  });
  
  // Sort rows
  filteredRows.sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime(); // newest first
    } else if (sortBy === 'patient') {
      return a.patientName.localeCompare(b.patientName);
    }
    return 0;
  });

  return (
    <div className="patients-container">
      <div className="patients-header">
        <h1>APPOINTMENTS</h1>
      </div>
      
      <div className="search-and-sort">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="sort-controls">
          <span>Sort by:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-dropdown"
          >
            <option value="date">Appointment Date</option>
            <option value="patient">Patient Name</option>
          </select>
        </div>
      </div>
      
      <div className="patients-table">
        <div className="table-header">
          <div className="checkbox-cell">
            <input type="checkbox" />
          </div>
          <div className="cell patient-info-header">Patient Info</div>
          <div className="cell">Phone Number</div>
          <div className="cell">Appointment Date</div>
          <div className="cell">Treatment</div>
          <div className="cell">Analyzed Image</div>
          <div className="cell">Actions</div>
        </div>
        
        {filteredRows.length === 0 ? (
          <div className="no-appointments">No appointments found matching your search.</div>
        ) : (
          filteredRows.map(row => (
            <div className="table-row" key={row.id}>
              <div className="checkbox-cell">
                <input type="checkbox" />
              </div>
              <div className="cell patient-info">
                <div className="patient-name">{row.patientName}</div>
                <div className="patient-email">{row.patientEmail}</div>
              </div>
              <div className="cell">
                {row.phoneNumber}
              </div>
              <div className="cell">
                {formatDate(row.date)}
              </div>
              <div className="cell">
                {renderTreatmentDropdown(row.id, row.treatment)}
              </div>
              <div className="cell">
                {row.analyzedImage ? (
                  <button 
                    className="view-file-btn"
                    onClick={() => viewAnalysisDetails(row.analyzedImage as ImageAnalysis)}
                  >
                    View Image
                  </button>
                ) : (
                  "No image"
                )}
              </div>
              <div className="cell">
                <button 
                  className="set-appointment-btn"
                  onClick={() => handleSetAppointment(row.patientId)}
                >
                  Set Appointment
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
);
};
export default PatientsPage;