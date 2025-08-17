export interface UserCreationRequest {
    email: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    dob: string;
}

export interface UserCreationResponse {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    dob: string;
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
