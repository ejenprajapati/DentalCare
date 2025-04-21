// services/userApi.ts
import axios from 'axios';
import { User, UpdateProfileData, UpdatePasswordData } from '../types/user';

 const API_BASE_URL = 'http://127.0.0.1:8000/api';


// Create axios instance with authentication headers
const authAxios = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to every request
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getUserProfile = async (): Promise<User> => {
  const response = await authAxios.get('/user/profile/');
  return response.data;
};

export const updateUserProfile = async (data: UpdateProfileData): Promise<User> => {
  // Create FormData to handle file uploads
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  
  const response = await authAxios.patch('/user/profile/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

export const updateUserPassword = async (data: UpdatePasswordData): Promise<{ success: boolean }> => {
  const response = await authAxios.post('/user/change-password/', data);
  return response.data;
};

export const deleteUserAccount = async (): Promise<void> => {
  await authAxios.delete('/user/profile/');
  // Clear auth token and other stored data
  localStorage.removeItem('access');
};