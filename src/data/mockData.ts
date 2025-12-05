import { Patient, Doctor, Appointment, Bill, LabTest, Medicine, DashboardStats } from '@/types/hospital';

export const mockPatients: Patient[] = [
  { id: '1', name: 'John Smith', age: 45, gender: 'Male', phone: '+1-234-567-8901', email: 'john@email.com', address: '123 Main St', bloodGroup: 'A+', registrationDate: '2024-01-15', status: 'Active' },
  { id: '2', name: 'Sarah Johnson', age: 32, gender: 'Female', phone: '+1-234-567-8902', email: 'sarah@email.com', address: '456 Oak Ave', bloodGroup: 'B+', registrationDate: '2024-02-20', status: 'Active' },
  { id: '3', name: 'Michael Brown', age: 58, gender: 'Male', phone: '+1-234-567-8903', email: 'michael@email.com', address: '789 Pine Rd', bloodGroup: 'O-', registrationDate: '2024-03-10', status: 'Active' },
  { id: '4', name: 'Emily Davis', age: 28, gender: 'Female', phone: '+1-234-567-8904', email: 'emily@email.com', address: '321 Elm St', bloodGroup: 'AB+', registrationDate: '2024-04-05', status: 'Inactive' },
  { id: '5', name: 'Robert Wilson', age: 67, gender: 'Male', phone: '+1-234-567-8905', email: 'robert@email.com', address: '654 Maple Dr', bloodGroup: 'A-', registrationDate: '2024-05-12', status: 'Active' },
];

export const mockDoctors: Doctor[] = [
  { id: '1', name: 'Dr. A. John', specialization: 'Cardiology', phone: '+1-234-567-8001', email: 'dr.john@hospital.com', availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], status: 'Available' },
  { id: '2', name: 'Dr. B. Sarah', specialization: 'Neurology', phone: '+1-234-567-8002', email: 'dr.sarah@hospital.com', availability: ['Mon', 'Wed', 'Fri'], status: 'Available' },
  { id: '3', name: 'Dr. C. Mike', specialization: 'Orthopedics', phone: '+1-234-567-8003', email: 'dr.mike@hospital.com', availability: ['Tue', 'Thu', 'Sat'], status: 'Busy' },
  { id: '4', name: 'Dr. D. Emma', specialization: 'Pediatrics', phone: '+1-234-567-8004', email: 'dr.emma@hospital.com', availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], status: 'Available' },
];

export const mockAppointments: Appointment[] = [
  { id: '1', patientId: '1', patientName: 'John Smith', doctorId: '1', doctorName: 'Dr. A. John', date: '2025-11-18', time: '09:00', duration: 30, status: 'Scheduled', type: 'Consultation' },
  { id: '2', patientId: '2', patientName: 'Sarah Johnson', doctorId: '2', doctorName: 'Dr. B. Sarah', date: '2025-11-18', time: '10:30', duration: 45, status: 'Scheduled', type: 'Follow-up' },
  { id: '3', patientId: '3', patientName: 'Michael Brown', doctorId: '1', doctorName: 'Dr. A. John', date: '2025-11-19', time: '11:00', duration: 30, status: 'Scheduled', type: 'Routine' },
  { id: '4', patientId: '4', patientName: 'Emily Davis', doctorId: '3', doctorName: 'Dr. C. Mike', date: '2025-11-20', time: '14:00', duration: 60, status: 'Scheduled', type: 'Consultation' },
];

export const mockBills: Bill[] = [
  { id: '1', patientId: '1', patientName: 'John Smith', items: [{ description: 'Consultation Fee', quantity: 1, unitPrice: 150, amount: 150 }, { description: 'Blood Test', quantity: 1, unitPrice: 75, amount: 75 }], totalAmount: 225, paidAmount: 225, status: 'Paid', date: '2024-11-15', dueDate: '2024-11-30' },
  { id: '2', patientId: '2', patientName: 'Sarah Johnson', items: [{ description: 'Consultation Fee', quantity: 1, unitPrice: 150, amount: 150 }], totalAmount: 150, paidAmount: 100, status: 'Partial', date: '2024-11-16', dueDate: '2024-12-01' },
  { id: '3', patientId: '3', patientName: 'Michael Brown', items: [{ description: 'X-Ray', quantity: 1, unitPrice: 200, amount: 200 }, { description: 'Consultation Fee', quantity: 1, unitPrice: 150, amount: 150 }], totalAmount: 350, paidAmount: 0, status: 'Pending', date: '2024-11-17', dueDate: '2024-12-02' },
];

export const mockLabTests: LabTest[] = [
  { id: '1', patientId: '1', patientName: 'John Smith', testName: 'Complete Blood Count', testType: 'Hematology', requestedBy: 'Dr. A. John', status: 'Completed', result: 'Normal', date: '2024-11-15', reportDate: '2024-11-16' },
  { id: '2', patientId: '2', patientName: 'Sarah Johnson', testName: 'Lipid Panel', testType: 'Biochemistry', requestedBy: 'Dr. B. Sarah', status: 'In-Progress', date: '2024-11-17' },
  { id: '3', patientId: '3', patientName: 'Michael Brown', testName: 'MRI Scan', testType: 'Radiology', requestedBy: 'Dr. C. Mike', status: 'Pending', date: '2024-11-18' },
];

export const mockMedicines: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', category: 'Analgesic', quantity: 500, unitPrice: 0.5, expiryDate: '2026-06-15', manufacturer: 'PharmaCo', status: 'In-Stock' },
  { id: '2', name: 'Amoxicillin 250mg', category: 'Antibiotic', quantity: 200, unitPrice: 1.25, expiryDate: '2025-12-20', manufacturer: 'MediLabs', status: 'In-Stock' },
  { id: '3', name: 'Omeprazole 20mg', category: 'Antacid', quantity: 50, unitPrice: 0.75, expiryDate: '2025-09-10', manufacturer: 'HealthGen', status: 'Low-Stock' },
  { id: '4', name: 'Metformin 500mg', category: 'Antidiabetic', quantity: 0, unitPrice: 0.60, expiryDate: '2026-03-25', manufacturer: 'DiabCare', status: 'Out-of-Stock' },
];

export const mockDashboardStats: DashboardStats = {
  totalPatients: 1250,
  todayAppointments: 24,
  pendingBills: 15,
  availableDoctors: 8,
  pendingLabTests: 12,
  lowStockMedicines: 5,
};
