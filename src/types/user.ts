export interface UserCreationRequest {
    email: string;
    username: string;
    password: string;
    fullName: string;   
   
}

export interface UserCreationResponse {
    email: string;
    username: string;   
    fullName: string; 
    userType: string;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string;
}

export enum Gender {
    Male = 0,
    Female = 1,
    Other = 2,
}

export interface PatientDetailResponse {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    avatar?: string;
    dob: string;
    gender?: Gender;
    address?: string;
    enable2FA?: boolean;
}


export interface PatientDetailRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    dob: string; // ISO date string (DateOnly from backend)
    gender?: Gender;
    address?: string;
}

export interface PatientDTOResponse {
  id: number;
  firstName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  recentAppointments: AppointmentSummary[];
}

export interface AppointmentSummary {
  appointmentId: number;
  patient: {
    patientId: number;
    fullName: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
  };
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  reasonForVisit: string;
  consultationFee: number;
  totalFee: number;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  userName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
}

export interface UpdateProfileResponse {
  userName: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
}