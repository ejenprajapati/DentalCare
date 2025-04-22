import axios from 'axios';

// Export the interface so it can be used in other components
export interface Appointment {
  id: number;
  dentist: number;
  dentist_name: string;
  date: string;
  start_time: string;
  end_time: string;
  detail: string;
  approved: boolean;
  analyzed_image?: {
    analyzed_image_url: string;
  };
}

const API_URL = 'http://127.0.0.1:8000';;

export const appointmentService = {
  // Get all appointments for the logged-in patient
  getAppointments: async (): Promise<Appointment[]> => {
    const token = localStorage.getItem('access');
    if (!token) {
      throw new Error('Authentication required');
    }
    try {
      const response = await axios.get(`${API_URL}/api/appointments/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },
  
  // Get a specific appointment by ID
  getAppointment: async (id: number): Promise<Appointment> => {
    const token = localStorage.getItem('access');
    if (!token) {
      throw new Error('Authentication required');
    }
    try {
      const response = await axios.get(`${API_URL}/api/appointments/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Schedule a new appointment
  createAppointment: async (appointmentData: Partial<Appointment>): Promise<Appointment> => {
    const token = localStorage.getItem('access');
    if (!token) {
      throw new Error('Authentication required');
    }
    try {
      const response = await axios.post(`${API_URL}/api/appointments/`, appointmentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },
  
  // Cancel or update an appointment
  updateAppointment: async (id: number, appointmentData: Partial<Appointment>): Promise<Appointment> => {
    const token = localStorage.getItem('access');
    if (!token) {
      throw new Error('Authentication required');
    }
    try {
      const response = await axios.patch(`${API_URL}/api/appointments/${id}/`, appointmentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating appointment with ID ${id}:`, error);
      throw error;
    }
  }
};

export default appointmentService;