export type UserRole =
  | "SUPER_ADMIN"
  | "HOSPITAL_ADMIN"
  | "DOCTOR"
  | "RECEPTIONIST"
  | "NURSE"
  | "CASHIER"
  | "LAB_TECHNICIAN"
  | "PHARMACIST"
  | "PATIENT";

export interface CurrentUser {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string | null;
  patientId?: string | null;
  doctorId?: string | null;
  staffId?: string | null;
}

export interface PatientSummary {
  id: string;
  uhid: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string | null;
  phone: string | null;
  email: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  occupiedBed?: {
    bedNumber: string;
    room: {
      roomNumber: string;
      type: string;
    };
  } | null;
}

export interface DoctorSummary {
  id: string;
  name: string;
  email: string;
  specialization: string;
  departmentName: string;
  consultationFee: number;
  roomNumber: string | null;
  status: string;
  experienceYears: number;
}

export interface AppointmentItem {
  id: string;
  appointmentNumber: string;
  patientName: string;
  patientUhid: string;
  doctorName: string;
  departmentName: string;
  appointmentDate: string;
  timeSlot: string;
  tokenNumber: number;
  status: string;
  type: string;
  priority: string;
}

export interface BedItem {
  id: string;
  bedNumber: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  floor: string;
  dailyRate: number;
  isOccupied: boolean;
  status: string;
  patientName?: string | null;
  patientUhid?: string | null;
}

export interface BillSummary {
  id: string;
  billNumber: string;
  patientName: string;
  patientUhid: string;
  billType: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: string;
  createdAt: string;
}
