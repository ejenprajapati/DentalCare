import React, { useState, useEffect } from 'react';
import '../components/MyAppointments.css';
import appointmentService from '../services/appointmentService';

// Import the Appointment interface from the service
import { Appointment } from '../services/appointmentService';

// Define Dentist interface if needed
interface Dentist {
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
  specialization: string;
}

const MyAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  
  // Format date to display as MM/DD/YYYY
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // Toggle selection of a row
  const toggleRowSelection = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Select/deselect all rows
  const toggleSelectAll = () => {
    if (selectedRows.length === appointments.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(appointments.map(appointment => appointment.id));
    }
  };

  // Fetch appointments data using the service
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentService.getAppointments();
        setAppointments(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments. Please try again later.');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="appointments-container">
      <h1 className="appointments-title">My Appointments</h1>
      
      {/* <div className="appointments-actions">
        <button className="btn-primary">Schedule New Appointment</button>
        <div className="search-container">
          <input type="text" placeholder="Search..." />
        </div>
      </div> */}
      
      <div className="table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  checked={selectedRows.length === appointments.length && appointments.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Dentist Info</th>
              <th>Appointment Date</th>
              <th>Time</th>
              <th>Reason/Detail</th>
              {/* <th>Analyzed Image</th> */}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedRows.includes(appointment.id)}
                      onChange={() => toggleRowSelection(appointment.id)}
                    />
                  </td>
                  <td>
                    <div className="dentist-info">
                      <span className="dentist-name">{appointment.dentist_name}</span>
                    </div>
                  </td>
                  <td>{formatDate(appointment.date)}</td>
                  <td>{`${appointment.start_time} - ${appointment.end_time}`}</td>
                  <td>{appointment.detail || 'No details provided'}</td>
                  {/* <td>
                    {appointment.analyzed_image ? (
                      <button className="btn-view-image">View</button>
                    ) : (
                      <span>No image</span>
                    )}
                  </td> */}
                  <td>
                    <span className={`status-badge ${appointment.approved ? 'approved' : 'pending'}`}>
                      {appointment.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="no-appointments">
                  No appointments found. Schedule your first appointment!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyAppointments;