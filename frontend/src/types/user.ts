// types/user.ts
export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string | null;
    role: 'patient' | 'dentist';
    gender: 'male' | 'female' | 'other' | null;
    profile_picture_url: string;
    patient?: {
      id: number;
    };
  }
  
  export interface DentistProfile extends User {
    dentist: {
      specialization: string | null;
      experience: string | null;
      qualification: string | null;
    };
  }
  
  export interface PatientProfile extends User {
    patient: {
      id: number;
      emergency_contact: string | null;
      allergies: string | null;
      member_since: string;
    };
  }
  export interface UpdateProfileData {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    gender?: string;
    profile_picture?: File;
  }
  
  export interface UpdatePasswordData {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }