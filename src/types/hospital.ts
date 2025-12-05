export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  registrationDate: string;
  status: 'Active' | 'Inactive';
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  availability: string[];
  status: 'Available' | 'Busy' | 'Off-duty';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  notes?: string;
  type: 'Consultation' | 'Follow-up' | 'Emergency' | 'Routine';
}

export interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  date: string;
  followUpDate?: string;
}

export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  items: BillItem[];
  totalAmount: number;
  paidAmount: number;
  status: 'Pending' | 'Partial' | 'Paid';
  date: string;
  dueDate: string;
}

export interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface LabTest {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  testType: string;
  requestedBy: string;
  status: 'Pending' | 'In-Progress' | 'Completed';
  result?: string;
  date: string;
  reportDate?: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  expiryDate: string;
  manufacturer: string;
  status: 'In-Stock' | 'Low-Stock' | 'Out-of-Stock';
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingBills: number;
  availableDoctors: number;
  pendingLabTests: number;
  lowStockMedicines: number;
}
