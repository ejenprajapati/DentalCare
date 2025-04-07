// src/components/PatientsList.tsx
import React, { useState, useEffect } from 'react';
import api from '../api';

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  nextAppointment: string;
  lastAppointment: string;
  disease: string;
  analyzed: boolean;
}

const PatientsList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('lastAppointment');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/patients/');
      setPatients(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.disease.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="patients-container">
      <div className="patients-header">
        <h2>PATIENTS</h2>
        <div className="total-patients">
          <span>Total patients</span>
          <div className="count">{patients.length}</div>
        </div>
      </div>
      
      <div className="controls">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="filters">
          <button className="btn-filter">Filters</button>
        </div>
        <div className="sort">
          <span>Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="lastAppointment">Last Appointment</option>
            <option value="nextAppointment">Next Appointment</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
      
      <div className="patients-table">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Patient Info</th>
              <th>Phone Number</th>
              <th>Next Appointment</th>
              <th>Last Appointment</th>
              <th>Disease</th>
              <th>Analyzed Pic</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>Loading patients...</td>
              </tr>
            ) : filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={7}>No patients found</td>
              </tr>
            ) : (
              filteredPatients.map(patient => (
                <tr key={patient.id}>
                  <td><input type="checkbox" /></td>
                  <td>
                    <div className="patient-info">
                      <div className="name">{patient.name}</div>
                      <div className="email">{patient.email}</div>
                    </div>
                  </td>
                  <td>{patient.phone}</td>
                  <td>{patient.nextAppointment}</td>
                  <td>{patient.lastAppointment}</td>
                  <td>{patient.disease}</td>
                  <td>
                    {patient.analyzed && (
                      <button className="btn-view-file">View File</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientsList;